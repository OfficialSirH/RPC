import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import type { APIApplication, APIUser, OAuth2Scopes, Snowflake } from 'discord-api-types/v10';
import { randomUUID } from 'node:crypto';
import { clearTimeout, setTimeout } from 'node:timers';
import type { MappedRPCCommandsArgs, RPCCallableCommands, RPCMessage } from './constants';
import { RPCCommands, RPCEvents, RelationshipType } from './constants';
import { IPCTransport } from './ipc';
import { getPid } from './util';

export interface RPCLoginOptions {
	accessToken: string;
	clientId: string;
	clientSecret: string;
  /**
   * https://discord.com/developers/docs/topics/oauth2#authorization-code-grant
   * 
   * for authorization requests
   */
	prompt?: 'consent' | 'none';
  /**
   * https://discord.com/developers/docs/topics/oauth2#authorization-code-grant
   * 
   * for authorization requests
   */
	redirectUri?: string;
	rpcToken: string;
	scopes: OAuth2Scopes[];
  tokenEndpoint: string;
  username: string; 
}

export interface RPCAuthorizationOptions extends Partial<RPCLoginOptions> {
  
}

function subKey(event: RPCEvents, args: unknown) {
  return `${event}${JSON.stringify(args)}`;
}

/**
 * The client for interacting with Discord RPC
 */
export class RPCClient extends AsyncEventEmitter {
  public options: Partial<RPCLoginOptions>;

  public accessToken: string | null;

  public clientId: string | null;
  
  public application: APIApplication | null;
  
  public user: APIUser | null;
  
  public transport: IPCTransport;
  
  /**
   * Map of nonces being expected from the transport
   */
  readonly #expected_nonces: Map<string, { reject(this: void, reason?: unknown): void, resolve(this: void, value: unknown): void; }>;
  
  /**
   * Promise for connection
   */
  #connectPromise: Promise<RPCClient> | undefined;
  
  public constructor(options: Partial<RPCLoginOptions> = {}) {
    super();

    this.options = options;

    this.accessToken = null;
    this.clientId = null;
    this.application = null;
    this.user = null;

    this.transport = new IPCTransport(this);
    this.transport.on('message', this.#onRpcMessage.bind(this));

    this.#expected_nonces = new Map();

    this.#connectPromise = undefined;
  }

  /**
   * Search and connect to RPC
   */
  public async connect(clientId: string): Promise<RPCClient> {
    if (this.#connectPromise) {
      return this.#connectPromise;
    }

    const { promise, resolve, reject } = Promise.withResolvers<RPCClient>();
    this.#connectPromise = promise;
      this.clientId = clientId;
      const timeout = setTimeout(() => reject(new Error('RPC_CONNECTION_TIMEOUT')), 10e3);
      timeout.unref();
      this.once('connected', () => {
        clearTimeout(timeout);
        resolve(this);
      });

      this.transport.once('close', () => {
        for (const exp_nonce of this.#expected_nonces.values()) {
          exp_nonce.reject(new Error('connection closed'));
        }

        this.emit('disconnected');
        reject(new Error('connection closed'));
      });

      try {
        await this.transport.connect();
      } catch (error) {
        reject(error);
      }

    return this.#connectPromise;
  }

  /**
   * Performs authentication flow. Automatically calls Client#connect if needed.
   *
   * @param options - Options for authentication.
   * At least one property must be provided to perform login.
   * @example
   * logging in with a client id and secret
   * ```ts
   * client.login({ clientId: '1234567', clientSecret: 'abcdef123' });
   * ```
   */
  public async login(options: Partial<RPCLoginOptions> = {}): Promise<RPCClient> {
    const { clientId } = options ?? this.options;
    if (!clientId) {
      throw new Error('A client id must be provided to login');
    }

    await this.connect(clientId);
    
    if (!options.scopes) {
      this.emit('ready');
      return this;
    }

    let { accessToken } = options ?? this.options;
    if (!accessToken) {
      accessToken = await this.authorize(options);
    }

    return this.authenticate(accessToken!);
  }

  /**
   * Request
   *
   * @param cmd - Command
   * @param args - Arguments
   * @param evt - Event
   */
  async #request<Cmd extends RPCCallableCommands = RPCCallableCommands>(cmd: Cmd, args: MappedRPCCommandsArgs[Cmd], evt?: RPCEvents) {
    return new Promise((resolve, reject) => {
      const nonce = randomUUID();
      const payload: { cmd: Cmd, args: MappedRPCCommandsArgs[Cmd], nonce: string, evt?: RPCEvents } = { cmd, args, nonce };
      if (cmd === RPCCommands.Subscribe || cmd === RPCCommands.Unsubscribe) {
        payload.evt = evt!;
      }
      this.transport.send({ cmd, args, evt, nonce });
      this.#expected_nonces.set(nonce, { resolve, reject });
    });
  }

  /**
   * Message handler
   *
   * @param message - message
   */
  #onRpcMessage(message: RPCMessage) {
    if (message.cmd === RPCCommands.Dispatch && message.evt === RPCEvents.Ready) {
      if (message.data.user) {
        this.user = message.data.user;
      }

      this.emit('connected');
    } else if (message.cmd !== RPCCommands.Dispatch && this.#expected_nonces.has(message.nonce)) {
      const { resolve, reject } = this.#expected_nonces.get(message.nonce)!;
      if (message.evt === RPCEvents.Error) {
        const e = new Error(message.data.message);
        e.code = message.data.code;
        e.data = message.data;
        reject(e);
      } else {
        resolve(message.data);
      }

      this.#expected_nonces.delete(message.nonce);
    } else {
      this.emit(message.evt, message.data);
    }
  }

  /**
   * Authorize
   *
   * @param options - authorization options
   */
  private async authorize({ scopes, clientSecret, rpcToken, redirectUri, prompt }: Partial<RPCLoginOptions> = {}): Promise<any> {
    if (clientSecret && rpcToken === true) {
      const body = await this.fetch('POST', '/oauth2/token/rpc', {
        data: new URLSearchParams({
          client_id: this.clientId,
          client_secret: clientSecret,
        }),
      });
      rpcToken = body.rpc_token;
    }

    const { code } = await this.#request(RPCCommands.Authorize, {
      scopes,
      client_id: this.clientId,
      prompt,
      rpc_token: rpcToken,
    });

    const response = await this.fetch('POST', '/oauth2/token', {
      data: new URLSearchParams({
        client_id: this.clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    return response.access_token;
  }

  /**
   * Authenticate
   *
   * @param {string} accessToken access token
   * @returns {Promise}
   * @private
   */
  async authenticate(accessToken: string): Promise<any> {
    return this.#request(RPCCommands.Authenticate, { access_token: accessToken })
      .then(({ application, user }) => {
        this.accessToken = accessToken;
        this.application = application;
        this.user = user;
        this.emit('ready');
        return this;
      });
  }


  /**
   * Fetch a guild
   *
   * @param {Snowflake} id Guild ID
   * @param {number} [timeout] Timeout request
   * @returns {Promise<Guild>}
   */
  async getGuild(id: Snowflake, timeout: number): Promise<Guild> {
    return this.#request(RPCCommands.GetGuild, { guild_id: id, timeout });
  }

  /**
   * Fetch all guilds
   *
   * @param {number} [timeout] Timeout request
   * @returns {Promise<Collection<Snowflake, Guild>>}
   */
  async getGuilds(timeout: number): Promise<Collection<Snowflake, Guild>> {
    return this.#request(RPCCommands.GetGuilds, { timeout });
  }

  /**
   * Get a channel
   *
   * @param {Snowflake} id Channel ID
   * @param {number} [timeout] Timeout request
   * @returns {Promise<Channel>}
   */
  async getChannel(id: Snowflake, timeout: number): Promise<Channel> {
    return this.#request(RPCCommands.GetChannel, { channel_id: id, timeout });
  }

  /**
   * Get all channels
   *
   * @param {Snowflake} [id] Guild ID
   * @param {number} [timeout] Timeout request
   * @returns {Promise<Collection<Snowflake, Channel>>}
   */
  async getChannels(id: Snowflake, timeout: number): Promise<Collection<Snowflake, Channel>> {
    const { channels } = await this.#request(RPCCommands.GetChannels, {
      timeout,
      guild_id: id,
    });
    return channels;
  }

  /**
   * @typedef {CertifiedDevice}
   * @prop {string} type One of `AUDIO_INPUT`, `AUDIO_OUTPUT`, `VIDEO_INPUT`
   * @prop {string} uuid This device's Windows UUID
   * @prop {object} vendor Vendor information
   * @prop {string} vendor.name Vendor's name
   * @prop {string} vendor.url Vendor's url
   * @prop {object} model Model information
   * @prop {string} model.name Model's name
   * @prop {string} model.url Model's url
   * @prop {string[]} related Array of related product's Windows UUIDs
   * @prop {boolean} echoCancellation If the device has echo cancellation
   * @prop {boolean} noiseSuppression If the device has noise suppression
   * @prop {boolean} automaticGainControl If the device has automatic gain control
   * @prop {boolean} hardwareMute If the device has a hardware mute
   */

  /**
   * Tell discord which devices are certified
   *
   * @param {CertifiedDevice[]} devices Certified devices to send to discord
   * @returns {Promise}
   */
  async setCertifiedDevices(devices: CertifiedDevice[]): Promise<any> {
    return this.#request(RPCCommands.SetCertifiedDevices, {
      devices: devices.map((d) => ({
        type: d.type,
        id: d.uuid,
        vendor: d.vendor,
        model: d.model,
        related: d.related,
        echo_cancellation: d.echoCancellation,
        noise_suppression: d.noiseSuppression,
        automatic_gain_control: d.automaticGainControl,
        hardware_mute: d.hardwareMute,
      })),
    });
  }

  /**
   * @typedef {UserVoiceSettings}
   * @prop {Snowflake} id ID of the user these settings apply to
   * @prop {?object} [pan] Pan settings, an object with `left` and `right` set between
   * 0.0 and 1.0, inclusive
   * @prop {?number} [volume=100] The volume
   * @prop {bool} [mute] If the user is muted
   */

  /**
   * Set the voice settings for a user, by id
   *
   * @param {Snowflake} id ID of the user to set
   * @param {UserVoiceSettings} settings Settings
   * @returns {Promise}
   */
  async setUserVoiceSettings(id: Snowflake, settings: UserVoiceSettings): Promise<any> {
    return this.#request(RPCCommands.SetUserVoiceSettings, {
      user_id: id,
      pan: settings.pan,
      mute: settings.mute,
      volume: settings.volume,
    });
  }

  /**
   * Move the user to a voice channel
   *
   * @param {Snowflake} id ID of the voice channel
   * @param {object} [options] Options
   * @param {number} [options.timeout] Timeout for the command
   * @param {boolean} [options.force] Force this move. This should only be done if you
   * have explicit permission from the user.
   * @returns {Promise}
   */
  async selectVoiceChannel(id: Snowflake, { timeout, force = false }: { force?: boolean; timeout?: number; } = {}): Promise<any> {
    return this.#request(RPCCommands.SelectVoiceChannel, { channel_id: id, timeout, force });
  }

  /**
   * Move the user to a text channel
   *
   * @param {Snowflake} id ID of the voice channel
   * @param {object} [options] Options
   * @param {number} [options.timeout] Timeout for the command
   * have explicit permission from the user.
   * @returns {Promise}
   */
  async selectTextChannel(id: Snowflake, { timeout }: { timeout?: number; } = {}): Promise<any> {
    return this.#request(RPCCommands.SelectTextChannel, { channel_id: id, timeout });
  }

  /**
   * Get current voice settings
   *
   * @returns {Promise}
   */
  async getVoiceSettings(): Promise<any> {
    return this.#request(RPCCommands.GetVoiceSettings)
      .then((s) => ({
        automaticGainControl: s.automatic_gain_control,
        echoCancellation: s.echo_cancellation,
        noiseSuppression: s.noise_suppression,
        qos: s.qos,
        silenceWarning: s.silence_warning,
        deaf: s.deaf,
        mute: s.mute,
        input: {
          availableDevices: s.input.available_devices,
          device: s.input.device_id,
          volume: s.input.volume,
        },
        output: {
          availableDevices: s.output.available_devices,
          device: s.output.device_id,
          volume: s.output.volume,
        },
        mode: {
          type: s.mode.type,
          autoThreshold: s.mode.auto_threshold,
          threshold: s.mode.threshold,
          shortcut: s.mode.shortcut,
          delay: s.mode.delay,
        },
      }));
  }

  /**
   * Set current voice settings, overriding the current settings until this session disconnects.
   * This also locks the settings for any other rpc sessions which may be connected.
   *
   * @param {object} args Settings
   * @returns {Promise}
   */
  async setVoiceSettings(args: object): Promise<any> {
    return this.#request(RPCCommands.SetVoiceSettings, {
      automatic_gain_control: args.automaticGainControl,
      echo_cancellation: args.echoCancellation,
      noise_suppression: args.noiseSuppression,
      qos: args.qos,
      silence_warning: args.silenceWarning,
      deaf: args.deaf,
      mute: args.mute,
      input: args.input ? {
        device_id: args.input.device,
        volume: args.input.volume,
      } : undefined,
      output: args.output ? {
        device_id: args.output.device,
        volume: args.output.volume,
      } : undefined,
      mode: args.mode ? {
        type: args.mode.type,
        auto_threshold: args.mode.autoThreshold,
        threshold: args.mode.threshold,
        shortcut: args.mode.shortcut,
        delay: args.mode.delay,
      } : undefined,
    });
  }

  /**
   * Capture a shortcut using the client
   * The callback takes (key, stop) where `stop` is a function that will stop capturing.
   * This `stop` function must be called before disconnecting or else the user will have
   * to restart their client.
   *
   * @param {Function} callback Callback handling keys
   * @returns {Promise<Function>}
   */
  async captureShortcut(callback: Function): Promise<Function> {
    const subid = subKey(RPCEvents.CaptureShortcutChange);
    const stop = async () => {
      this._subscriptions.delete(subid);
      return this.#request(RPCCommands.CaptureShortcut, { action: 'STOP' });
    };

    this._subscriptions.set(subid, ({ shortcut }) => {
      callback(shortcut, stop);
    });
    return this.#request(RPCCommands.CaptureShortcut, { action: 'START' })
      .then(() => stop);
  }

  /**
   * Sets the presence for the logged in user.
   *
   * @param {object} args The rich presence to pass.
   * @param {number} [pid] The application's process ID. Defaults to the executing process' PID.
   * @returns {Promise}
   */
  public async setActivity(args: object = {}, pid: number | null = getPid()): Promise<any> {
    let timestamps;
    let assets;
    let party;
    let secrets;
    if (args.startTimestamp || args.endTimestamp) {
      timestamps = {
        start: args.startTimestamp,
        end: args.endTimestamp,
      };
      if (timestamps.start instanceof Date) {
        timestamps.start = Math.round(timestamps.start.getTime());
      }

      if (timestamps.end instanceof Date) {
        timestamps.end = Math.round(timestamps.end.getTime());
      }

      if (timestamps.start > 2_147_483_647_000) {
        throw new RangeError('timestamps.start must fit into a unix timestamp');
      }

      if (timestamps.end > 2_147_483_647_000) {
        throw new RangeError('timestamps.end must fit into a unix timestamp');
      }
    }

    if (
      args.largeImageKey || args.largeImageText
      || args.smallImageKey || args.smallImageText
    ) {
      assets = {
        large_image: args.largeImageKey,
        large_text: args.largeImageText,
        small_image: args.smallImageKey,
        small_text: args.smallImageText,
      };
    }

    if (args.partySize || args.partyId || args.partyMax) {
      party = { id: args.partyId };
      if (args.partySize || args.partyMax) {
        party.size = [args.partySize, args.partyMax];
      }
    }

    if (args.matchSecret || args.joinSecret || args.spectateSecret) {
      secrets = {
        match: args.matchSecret,
        join: args.joinSecret,
        spectate: args.spectateSecret,
      };
    }

    return this.#request(RPCCommands.SetActivity, {
      pid: pid ?? 0,
      activity: {
        state: args.state,
        details: args.details,
        timestamps,
        assets,
        party,
        secrets,
        buttons: args.buttons,
        instance: Boolean(args.instance),
      },
    });
  }

  /**
   * Clears the currently set presence, if any. This will hide the "Playing X" message
   * displayed below the user's name.
   *
   * @param {number} [pid] The application's process ID. Defaults to the executing process' PID.
   * @returns {Promise}
   */
  public async clearActivity(pid: number | null = getPid()): Promise<any> {
    return this.#request(RPCCommands.SetActivity, {
      pid: pid ?? 0,
    });
  }

  /**
   * Invite a user to join the game the RPC user is currently playing
   *
   * @param {User} user The user to invite
   * @returns {Promise}
   */
  public async sendJoinInvite(user: User): Promise<any> {
    return this.#request(RPCCommands.SendActivityJoinInvite, {
      user_id: user.id || user,
    });
  }

  /**
   * Request to join the game the user is playing
   *
   * @param {User} user The user whose game you want to request to join
   * @returns {Promise}
   */
  public async sendJoinRequest(user: User): Promise<any> {
    return this.#request(RPCCommands.SendActivityJoinRequest, {
      user_id: user.id || user,
    });
  }

  /**
   * Reject a join request from a user
   *
   * @param {User} user The user whose request you wish to reject
   * @returns {Promise}
   */
  public async closeJoinRequest(user: User): Promise<any> {
    return this.#request(RPCCommands.CloseActivityRequest, {
      user_id: user.id || user,
    });
  }

  public async createLobby(type, capacity, metadata) {
    return this.#request(RPCCommands.CreateLobby, {
      type,
      capacity,
      metadata,
    });
  }

  public async updateLobby(lobby, { type, owner, capacity, metadata } = {}) {
    return this.#request(RPCCommands.UpdateLobby, {
      id: lobby.id || lobby,
      type,
      owner_id: (owner?.id) || owner,
      capacity,
      metadata,
    });
  }

  public async deleteLobby(lobby) {
    return this.#request(RPCCommands.DeleteLobby, {
      id: lobby.id || lobby,
    });
  }

  public async connectToLobby(id, secret) {
    return this.#request(RPCCommands.ConnectToLobby, {
      id,
      secret,
    });
  }

  public async sendToLobby(lobby, data) {
    return this.#request(RPCCommands.SendToLobby, {
      id: lobby.id || lobby,
      data,
    });
  }

  public async disconnectFromLobby(lobby) {
    return this.#request(RPCCommands.DisconnectFromLobby, {
      id: lobby.id || lobby,
    });
  }

  public async updateLobbyMember(lobby, user, metadata) {
    return this.#request(RPCCommands.UpdateLobbyMember, {
      lobby_id: lobby.id || lobby,
      user_id: user.id || user,
      metadata,
    });
  }

  public async getRelationships() {
    const types = Object.keys(RelationshipType);
    return this.#request(RPCCommands.GetRelationships)
      .then((o) => o.relationships.map((r) => ({
        ...r,
        type: types[r.type],
      })));
  }

  /**
   * Subscribe to an event
   *
   * @param event - Name of event e.g. `MESSAGE_CREATE`
   * @param args - Args for event e.g. `{ channel_id: '1234' }`
   */
  public async subscribe(event: string, args: object): Promise<object> {
    await this.#request(RPCCommands.Subscribe, args, event);
    return {
      unsubscribe: async () => this.#request(RPCCommands.Unsubscribe, args, event),
    };
  }

  /**
   * Destroy the client
   */
  public async destroy() {
    await this.transport.close();
  }
}
