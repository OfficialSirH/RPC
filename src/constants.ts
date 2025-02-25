/* eslint-disable tsdoc/syntax */
/* eslint-disable @typescript-eslint/no-empty-interface */

import type {
	APIMessage,
	APIPartialChannel,
	APIPartialGuild,
	APIUser,
	APIVoiceState,
	ChannelType,
	GatewayActivity,
	OAuth2Scopes,
	Snowflake,
} from 'discord-api-types/v10';

export const RPCVersion = '1';

/**
 * @unstable
 */
export interface RPCAPIMessageParsedContentOriginalMatch {
	0: string;
	index: 0;
}

/**
 * @unstable
 */
export interface RPCAPIMessageParsedContentText {
	type: 'text';
	originalMatch: RPCAPIMessageParsedContentOriginalMatch;
	content: string;
}

/**
 * @unstable
 */
export interface RPCAPIMessageParsedContentMention {
	type: 'mention';
	userId: Snowflake;
	channelId: Snowflake;
	guildId: Snowflake;
	/**
	 * same as `userId`
	 */
	parsedUserId: Snowflake;
	content: Omit<RPCAPIMessageParsedContentText, 'originalMatch'>;
}

/**
 * @unstable
 */
export interface RPCAPIMessage extends Omit<APIMessage, 'channel_id'> {
	/**
	 * the nickname of the user who sent the message
	 */
	nick?: string;
	/**
	 * the color of the author's name
	 */
	author_color?: number;
	/**
	 * the content of the message parsed into an array
	 */
	content_parsed: (RPCAPIMessageParsedContentText | RPCAPIMessageParsedContentMention)[];
}

/**
 * @unstable
 */
export enum RPCCaptureShortcutAction {
	Start = 'START',
	Stop = 'STOP',
}

/**
 * @unstable
 */
export type RPCLobbyMetadata = unknown;

/**
 * https://discord.com/developers/docs/topics/rpc#authenticate-oauth2-application-structure
 */
export interface RPCOAuth2Application {
	/**
	 * Application description
	 */
	description: string;
	/**
	 * Hash of the icon
	 */
	icon: string;
	/**
	 * Application client id
	 */
	id: Snowflake;
	/**
	 * Application name
	 */
	name: string;
	/**
	 * Array of rpc origin urls
	 */
	rpc_origins: string[];
}

export interface RPCDeviceVendor {
	/**
	 * name of the vendor
	 */
	name: string;
	/**
	 * url for the vendor
	 */
	url: string;
}

export interface RPCDeviceModel {
	/**
	 * name of the model
	 */
	name: string;
	/**
	 * url for the model
	 */
	url: string;
}

export enum RPCDeviceType {
	AudioInput = 'audioinput',
	AudioOutput = 'audiooutput',
	VideoInput = 'videoinput',
}

export interface BaseRPCCertifiedDevice<Type extends RPCDeviceType> {
	/**
	 * the device's Windows UUID
	 */
	id: string;
	/**
	 * the model of the product
	 */
	model: RPCDeviceModel;
	/**
	 * UUIDs of related devices
	 */
	related: string[];
	/**
	 * the type of device
	 */
	type: Type;
	/**
	 * the hardware vendor
	 */
	vendor: RPCDeviceVendor;
}

/**
 * https://discord.com/developers/docs/topics/rpc#setcertifieddevices-device-object
 */
export type RPCCertifiedDevice<Type extends RPCDeviceType = RPCDeviceType> = Type extends RPCDeviceType.AudioInput
	? BaseRPCCertifiedDevice<Type> & {
			/**
			 * if the device's native automatic gain control is enabled
			 */
			automatic_gain_control: boolean;
			/**
			 * if the device's native echo cancellation is enabled
			 */
			echo_cancellation: boolean;
			/**
			 * if the device is hardware muted
			 */
			hardware_mute: boolean;
			/**
			 * if the device's native noise suppression is enabled
			 */
			noise_suppression: boolean;
		}
	: BaseRPCCertifiedDevice<Type>;

export interface RPCVoiceAvailableDevice {
	/**
	 * device id
	 */
	id: string;
	/**
	 * device name
	 */
	name: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#getvoicesettings-voice-settings-input-object
 */
export interface RPCVoiceSettingsInput {
	/**
	 * array of read-only device objects containing `id` and `name` string keys
	 */
	available_devices: RPCVoiceAvailableDevice[];
	/**
	 * device id
	 */
	device_id: string;
	/**
	 * input voice level (min: 0.0, max: 100.0)
	 */
	volume: number;
}

/**
 * https://discord.com/developers/docs/topics/rpc#getvoicesettings-voice-settings-output-object
 */
export interface RPCVoiceSettingsOutput {
	/**
	 * array of read-only device objects containing `id` and `name` string keys
	 */
	available_devices: RPCVoiceAvailableDevice[];
	/**
	 * device id
	 */
	device_id: string;
	/**
	 * input voice level (min: 0.0, max: 200.0)
	 */
	volume: number;
}

export enum RPCVoiceSettingsModeType {
	PushToTalk = 'PUSH_TO_TALK',
	VoiceActivity = 'VOICE_ACTIVITY',
}

/**
 * https://discord.com/developers/docs/topics/rpc#getvoicesettings-key-types
 */
export enum RPCVoiceShortcutKeyComboKeyType {
	KeyboardKey,
	MouseButton,
	KeyboardModifierKey,
	GamepadButton,
}

/**
 * https://discord.com/developers/docs/topics/rpc#getvoicesettings-shortcut-key-combo-object
 */
export interface RPCVoiceShortcutKeyCombo {
	/**
	 * key code
	 */
	code: number;
	/**
	 * key name
	 */
	name: string;
	/**
	 * type of key
	 */
	type: RPCVoiceShortcutKeyComboKeyType;
}

/**
 * https://discord.com/developers/docs/topics/rpc#getvoicesettings-voice-settings-mode-object
 */
export interface RPCVoiceSettingsMode {
	/**
	 * voice activity threshold automatically sets its threshold
	 */
	auto_threshold: boolean;
	/**
	 * threshold for voice activity (in dB) (min: -100.0, max: 0.0)
	 */
	threshold: number;
	/**
	 * voice setting mode type (can be `PUSH_TO_TALK` or `VOICE_ACTIVITY`)
	 */
	type: RPCVoiceSettingsModeType;
	/**
	 * shortcut key combos for PTT
	 */
	shortcut: RPCVoiceShortcutKeyCombo;
	/**
	 * the PTT release delay (in ms) (min: 0, max: 2000)
	 */
	delay: number;
}

export enum VoiceConnectionStates {
	/**
	 * TCP authenticating
	 */
	Authenticating = 'AUTHENTICATING',
	/**
	 * Waiting for voice endpoint
	 */
	AwaitingEndpoint = 'AWAITING_ENDPOINT',
	/**
	 * TCP connected
	 */
	Connected = 'CONNECTED',
	/**
	 * TCP connecting
	 */
	Connecting = 'CONNECTING',
	/**
	 * TCP disconnected
	 */
	Disconnected = 'DISCONNECTED',
	/**
	 * WebRTC ice checking
	 */
	IceChecking = 'ICE_CHECKING',
	/**
	 * No route to host
	 */
	NoRoute = 'NO_ROUTE',
	/**
	 * TCP connected, Voice connected
	 */
	VoiceConnected = 'VOICE_CONNECTED',
	/**
	 * TCP connected, Voice connecting
	 */
	VoiceConnecting = 'VOICE_CONNECTING',
	/**
	 * TCP connected, Voice disconnected
	 */
	VoiceDisconnected = 'VOICE_DISCONNECTED',
}

/**
 * @unstable
 */
export enum LobbyType {
	Private = 1,
	Public,
}

/**
 * @unstable
 */
export enum RelationshipType {
	None,
	Friend,
	Blocked,
	PendingIncoming,
	PendingOutgoing,
	Implicit,
}

/**
 * @unstable
 */
export interface Relationship {
	/**
	 * the id of the user
	 */
	id: Snowflake;
	/**
	 * relationship type
	 */
	type: RelationshipType;
	/**
	 * user
	 */
	user: APIUser;
}

/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-error-codes
 */
export enum RPCErrorCodes {
	/**
	 * An unknown error occurred.
	 */
	UnknownError = 1_000,
	/**
	 * @unstable
	 */
	ServiceUnavailable,
	/**
	 * @unstable
	 */
	TransactionAborted,
	/**
	 * You sent an invalid payload.
	 */
	InvalidPayload = 4_000,
	/**
	 * Invalid command name specified.
	 */
	InvalidCommand = 4_002,
	/**
	 * Invalid guild ID specified.
	 */
	InvalidGuild,
	/**
	 * Invalid event name specified.
	 */
	InvalidEvent,
	/**
	 * Invalid channel ID specified.
	 */
	InvalidChannel,
	/**
	 * You lack permissions to access the given resource.
	 */
	InvalidPermissions,
	/**
	 * An invalid OAuth2 application ID was used to authorize or authenticate with.
	 */
	InvalidClientId,
	/**
	 * An invalid OAuth2 application origin was used to authorize or authenticate with.
	 */
	InvalidOrigin,
	/**
	 * An invalid OAuth2 token was used to authorize or authenticate with.
	 */
	InvalidToken,
	/**
	 * The specified user ID was invalid.
	 */
	InvalidUser,
	/**
	 * @unstable
	 */
	InvalidInvite,
	/**
	 * @unstable
	 */
	InvalidActivityJoinRequest,
	/**
	 * @unstable
	 */
	InvalidLobby,
	/**
	 * @unstable
	 */
	InvalidLobbySecret,
	/**
	 * @unstable
	 */
	InvalidEntitlement,
	/**
	 * @unstable
	 */
	InvalidGiftCode,
	/**
	 * A standard OAuth2 error occurred; check the data object for the OAuth2 error details.
	 */
	OAuth2Error = 5_000,
	/**
	 * An asynchronous `SELECT_TEXT_CHANNEL`/`SELECT_VOICE_CHANNEL` command timed out.
	 */
	SelectChannelTimedOut,
	/**
	 * An asynchronous `GET_GUILD` command timed out.
	 */
	GetGuildTimedOut,
	/**
	 * You tried to join a user to a voice channel but the user was already in one.
	 */
	SelectVoiceForceRequired,
	/**
	 * You tried to capture more than one shortcut key at once.
	 */
	CaptureShortcutAlreadyListening,
	/**
	 * @unstable
	 */
	InvalidActivitySecret,
	/**
	 * @unstable
	 */
	NoEligibleActivity,
	/**
	 * @unstable
	 */
	LobbyFull,
	/**
	 * @unstable
	 */
	PurchaseCanceled,
	/**
	 * @unstable
	 */
	PurchaseError,
	/**
	 * @unstable
	 */
	UnauthorizedForAchievement,
	/**
	 * @unstable
	 */
	RateLimited,
}

/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#rpc-rpc-close-event-codes
 */
export enum RPCCloseEventCodes {
	/**
	 * @unstable
	 */
	CloseNormal = 1_000,
	/**
	 * @unstable
	 */
	CloseUnsupported = 1_003,
	/**
	 * @unstable
	 */
	CloseAbnormal = 1_006,
	/**
	 * You connected to the RPC server with an invalid client ID.
	 */
	InvalidClientId = 4_000,
	/**
	 * You connected to the RPC server with an invalid origin.
	 */
	InvalidOrigin,
	/**
	 * You are being rate limited.
	 */
	RateLimited,
	/**
	 * The OAuth2 token associated with a connection was revoked, get a new one!
	 */
	TokenRevoked,
	/**
	 * The RPC Server version specified in the connection string was not valid.
	 */
	InvalidVersion,
	/**
	 * The encoding specified in the connection string was not valid.
	 */
	InvalidEncoding,
}

/**
 * https://discord.com/developers/docs/topics/rpc#commands-and-events-rpc-commands
 */
export enum RPCCommands {
	/**
	 * @unstable
	 */
	AcceptActivityInvite = 'ACCEPT_ACTIVITY_INVITE',
	/**
	 * @unstable
	 */
	ActivityInviteUser = 'ACTIVITY_INVITE_USER',
	/**
	 * Used to authenticate an existing client with your app
	 */
	Authenticate = 'AUTHENTICATE',
	/**
	 * Used to authorize a new client with your app
	 */
	Authorize = 'AUTHORIZE',
	/**
	 * @unstable
	 */
	BraintreePopupBridgeCallback = 'BRAINTREE_POPUP_BRIDGE_CALLBACK',
	/**
	 * @unstable
	 */
	BrowserHandoff = 'BROWSER_HANDOFF',
	CaptureShortcut = 'CAPTURE_SHORTCUT',
	/**
	 * 	used to reject a Rich Presence Ask to Join request
	 */
	CloseActivityJoinRequest = 'CLOSE_ACTIVITY_JOIN_REQUEST',
	/**
	 * @unstable
	 */
	ConnectToLobby = 'CONNECT_TO_LOBBY',
	/**
	 * @unstable
	 */
	ConnectToLobbyVoice = 'CONNECT_TO_LOBBY_VOICE',
	/**
	 * @unstable
	 */
	ConnectionsCallback = 'CONNECTIONS_CALLBACK',
	CreateChannelInvite = 'CREATE_CHANNEL_INVITE',
	/**
	 * @unstable
	 */
	CreateLobby = 'CREATE_LOBBY',
	/**
	 * @unstable
	 */
	DeepLink = 'DEEP_LINK',
	/**
	 * @unstable
	 */
	DeleteLobby = 'DELETE_LOBBY',
	/**
	 * @unstable
	 */
	DisconnectFromLobby = 'DISCONNECT_FROM_LOBBY',
	/**
	 * @unstable
	 */
	DisconnectFromLobbyVoice = 'DISCONNECT_FROM_LOBBY_VOICE',
	/**
	 * Event dispatch
	 */
	Dispatch = 'DISPATCH',
	/**
	 * @unstable
	 */
	GetApplicationTicket = 'GET_APPLICATION_TICKET',
	/**
	 * Used to retrieve channel information from the client
	 */
	GetChannel = 'GET_CHANNEL',
	/**
	 * Used to retrieve a list of channels for a guild from the client
	 */
	GetChannels = 'GET_CHANNELS',
	/**
	 * @unstable
	 */
	GetEntitlementTicket = 'GET_ENTITLEMENT_TICKET',
	/**
	 * @unstable
	 */
	GetEntitlements = 'GET_ENTITLEMENTS',
	/**
	 * Used to retrieve guild information from the client
	 */
	GetGuild = 'GET_GUILD',
	/**
	 * Used to retrieve a list of guilds from the client
	 */
	GetGuilds = 'GET_GUILDS',
	/**
	 * @unstable
	 */
	GetImage = 'GET_IMAGE',
	/**
	 * @unstable
	 */
	GetNetworkingConfig = 'GET_NETWORKING_CONFIG',
	/**
	 * @unstable
	 */
	GetRelationships = 'GET_RELATIONSHIPS',
	/**
	 * Used to get the current voice channel the client is in
	 */
	GetSelectedVoiceChannel = 'GET_SELECTED_VOICE_CHANNEL',
	/**
	 * @unstable
	 */
	GetSkus = 'GET_SKUS',
	/**
	 * @unstable
	 */
	GetUser = 'GET_USER',
	/**
	 * @unstable
	 */
	GetUserAchievements = 'GET_USER_ACHIEVEMENTS',
	/**
	 * Used to retrieve the client's voice settings
	 */
	GetVoiceSettings = 'GET_VOICE_SETTINGS',
	/**
	 * @unstable
	 */
	GiftCodeBrowser = 'GIFT_CODE_BROWSER',
	/**
	 * @unstable
	 */
	GuildTemplateBrowser = 'GUILD_TEMPLATE_BROWSER',
	/**
	 * @unstable
	 */
	InviteBrowser = 'INVITE_BROWSER',
	/**
	 * @unstable
	 */
	NetworkingCreateToken = 'NETWORKING_CREATE_TOKEN',
	/**
	 * @unstable
	 */
	NetworkingPeerMetrics = 'NETWORKING_PEER_METRICS',
	/**
	 * @unstable
	 */
	NetworkingSystemMetrics = 'NETWORKING_SYSTEM_METRICS',
	/**
	 * @unstable
	 */
	OpenOverlayActivityInvite = 'OPEN_OVERLAY_ACTIVITY_INVITE',
	/**
	 * @unstable
	 */
	OpenOverlayGuildInvite = 'OPEN_OVERLAY_GUILD_INVITE',
	/**
	 * @unstable
	 */
	OpenOverlayVoiceSettings = 'OPEN_OVERLAY_VOICE_SETTINGS',
	/**
	 * @unstable
	 */
	Overlay = 'OVERLAY',
	/**
	 * @unstable
	 */
	SearchLobbies = 'SEARCH_LOBBIES',
	/**
	 * Used to join or leave a text channel, group dm, or dm
	 */
	SelectTextChannel = 'SELECT_TEXT_CHANNEL',
	/**
	 * Used to join or leave a voice channel, group dm, or dm
	 */
	SelectVoiceChannel = 'SELECT_VOICE_CHANNEL',
	/**
	 * Used to consent to a Rich Presence Ask to Join request
	 */
	SendActivityJoinInvite = 'SEND_ACTIVITY_JOIN_INVITE',
	/**
	 * @unstable
	 */
	SendToLobby = 'SEND_TO_LOBBY',
	/**
	 * Used to update a user's Rich Presence
	 */
	SetActivity = 'SET_ACTIVITY',
	/**
	 * Used to send info about certified hardware devices
	 */
	SetCertifiedDevices = 'SET_CERTIFIED_DEVICES',
	/**
	 * @unstable
	 */
	SetOverlayLocked = 'SET_OVERLAY_LOCKED',
	/**
	 * @unstable
	 */
	SetUserAchievement = 'SET_USER_ACHIEVEMENT',
	/**
	 * Used to change voice settings of users in voice channels
	 */
	SetUserVoiceSettings = 'SET_USER_VOICE_SETTINGS',
	SetUserVoiceSettings2 = 'SET_USER_VOICE_SETTINGS_2',
	/**
	 * Used to set the client's voice settings
	 */
	SetVoiceSettings = 'SET_VOICE_SETTINGS',
	SetVoiceSettings2 = 'SET_VOICE_SETTINGS_2',
	/**
	 * @unstable
	 */
	StartPurchase = 'START_PURCHASE',
	/**
	 * Used to subscribe to an RPC event
	 */
	Subscribe = 'SUBSCRIBE',
	/**
	 * Used to unsubscribe from an RPC event
	 */
	Unsubscribe = 'UNSUBSCRIBE',
	/**
	 * @unstable
	 */
	UpdateLobby = 'UPDATE_LOBBY',
	/**
	 * @unstable
	 */
	UpdateLobbyMember = 'UPDATE_LOBBY_MEMBER',
	/**
	 * @unstable
	 */
	ValidateApplication = 'VALIDATE_APPLICATION',
}

/**
 * https://discord.com/developers/docs/topics/rpc#authorize-authorize-response-structure
 */
export interface RPCAuthorizeResultData {
	/**
	 * OAuth2 authorization code
	 */
	code: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#authorize-authorize-argument-structure
 */
export interface RPCAuthorizeArgs {
	/**
	 * OAuth2 application id
	 */
	client_id: string;
	/**
	 * scopes to authorize
	 */
	scopes: OAuth2Scopes[];
	/**
	 * 	username to create a guest account with if the user does not have Discord
	 */
	username?: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#authenticate-authenticate-argument-structure
 */
export interface RPCAuthenticateArgs {
	/**
	 * OAuth2 access token
	 */
	access_token: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#authenticate-authenticate-response-structure
 */
export interface RPCAuthenticateResultData {
	/**
	 * Application the user authorized
	 */
	application: RPCOAuth2Application;
	/**
	 * Expiration date of OAuth2 token
	 */
	expires: string;
	/**
	 * Authorized scopes
	 */
	scopes: OAuth2Scopes[];
	/**
	 * The authed user
	 */
	user: APIUser;
}

export interface RPCGetGuildsArgs {}

/**
 * https://discord.com/developers/docs/topics/rpc#getguilds-get-guilds-response-structure
 */
export interface RPCGetGuildsResultData {
	/**
	 * The guilds the user is in
	 */
	guilds: APIPartialGuild[];
}

/**
 * https://discord.com/developers/docs/topics/rpc#getguild-get-guild-argument-structure
 */
export interface RPCGetGuildArgs {
	/**
	 * Id of the guild to get
	 */
	guild_id: Snowflake;
	/**
	 * Asynchronously get guild with time to wait before timing out
	 */
	timeout?: number;
}

/**
 * https://discord.com/developers/docs/topics/rpc#getguild-get-guild-response-structure
 */
export interface RPCGetGuildResultData {
	/**
	 * Guild icon url
	 */
	icon_url: string | null;
	/**
	 * Guild id
	 */
	id: Snowflake;
	/**
	 * Members of the guild
	 *
	 * @deprecated This will always be an empty array
	 */
	members: [];
	/**
	 * Guild name
	 */
	name: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#getchannel
 */
export interface RPCGetChannelArgs {
	/**
	 * Id of the channel to get
	 */
	channel_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/topics/rpc#getchannel-get-channel-response-structure
 */
export interface RPCGetChannelResultData {
	/**
	 * (voice) bitrate of voice channel
	 */
	bitrate?: number;
	/**
	 * Channel's guild id
	 */
	guild_id: Snowflake;
	/**
	 * Channel id
	 */
	id: Snowflake;
	/**
	 * (text) channel's messages
	 */
	messages?: APIMessage[];
	/**
	 * Channel name
	 */
	name: string;
	/**
	 * Position of channel in channel list
	 */
	position: number;
	/**
	 * (text) channel topic
	 */
	topic?: string;
	/**
	 * Channel type
	 */
	type: ChannelType;
	/**
	 * (voice) user limit of voice channel (0 for none)
	 */
	user_limit?: number;
	/**
	 * (voice) channel's voice states
	 */
	voice_states?: APIVoiceState[];
}

/**
 * https://discord.com/developers/docs/topics/rpc#getchannels-get-channels-argument-structure
 */
export interface RPCGetChannelsArgs {
	/**
	 * Id of the guild to get channels for
	 */
	guild_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/topics/rpc#getchannels-get-channels-response-structure
 */
export interface RPCGetChannelsResultData {
	/**
	 * Guild channels the user is in
	 */
	channels: APIPartialChannel[];
}

/**
 * https://discord.com/developers/docs/topics/rpc#setuservoicesettings-pan-object
 */
export interface RPCVoicePan {
	/**
	 * Left pan of user (min: 0.0, max: 1.0)
	 */
	left: number;
	/**
	 * Right pan of user (min: 0.0, max: 1.0)
	 */
	right: number;
}

/**
 * https://discord.com/developers/docs/topics/rpc#setuservoicesettings
 *
 * @note Discord only supports a single modifier of voice settings at a time over RPC. If an app changes voice settings, it will lock voice settings so that other apps connected simultaneously lose the ability to change voice settings. Settings reset to what they were before being changed after the controlling app disconnects. When an app that has previously set voice settings connects, the client will swap to that app's configured voice settings and lock voice settings again.
 */
export interface RPCSetUserVoiceSettingsArgs {
	/**
	 * Set the mute state of the user
	 */
	mute?: boolean;
	/**
	 * Set the pan of the user
	 */
	pan?: RPCVoicePan;
	/**
	 * User id
	 */
	user_id: Snowflake;
	/**
	 * Set the volume of user (defaults to 100, min 0, max 200)
	 */
	volume?: number;
}

/**
 * https://discord.com/developers/docs/topics/rpc#setuservoicesettings-set-user-voice-settings-argument-and-response-structure
 */
export type RPCSetUserVoiceSettingsResultData = Required<RPCSetUserVoiceSettingsArgs>;

/**
 * https://discord.com/developers/docs/topics/rpc#selectvoicechannel-select-voice-channel-argument-structure
 *
 * @warning When trying to join the user to a voice channel, you will receive a `5003` error coded response if the user is already in a voice channel. The `force` parameter should only be specified in response to the case where a user is already in a voice channel and they have approved to be moved by your app to a new voice channel.
 */
export interface RPCSelectVoiceChannelArgs {
	/**
	 * Channel id to join (or `null` to leave)
	 */
	channel_id: Snowflake | null;
	/**
	 * Forces a user to join a voice channel
	 */
	force?: boolean;
	/**
	 * After joining the voice channel, navigate to it in the client
	 */
	navigate?: boolean;
	/**
	 * Asynchronously join channel with time to wait before timing out
	 */
	timeout?: number;
}

/**
 * https://discord.com/developers/docs/topics/rpc#selectvoicechannel
 */
export type RPCSelectVoiceChannelResultData = RPCGetChannelResultData | null;

/**
 * https://discord.com/developers/docs/topics/rpc#getselectedvoicechannel
 */
export type RPCGetSelectedVoiceChannelResultData = RPCGetChannelResultData | null;

/**
 * https://discord.com/developers/docs/topics/rpc#getselectedvoicechannel
 */
export interface RPCGetSelectedVoiceChannelArgs {}

/**
 * @unstable
 */
export interface RPCGetUserResultData {}
/**
 * @unstable
 */
export interface RPCGetUserArgs {}

/**
 * https://discord.com/developers/docs/topics/rpc#getvoicesettings-get-voice-settings-response-structure
 */
export interface RPCGetVoiceSettingsResultData {
	/**
	 * state of automatic gain control
	 */
	automatic_gain_control: boolean;
	/**
	 * state of self-deafen
	 */
	deaf: boolean;
	/**
	 * state of echo cancellation
	 */
	echo_cancellation: boolean;
	/**
	 * input settings
	 */
	input: RPCVoiceSettingsInput;
	/**
	 * voice mode settings
	 */
	mode: RPCVoiceSettingsMode;
	/**
	 * state of self-mute
	 */
	mute: boolean;
	/**
	 * state of noise suppression
	 */
	noise_suppression: boolean;
	/**
	 * output settings
	 */
	output: RPCVoiceSettingsOutput;
	/**
	 * state of voice quality of service
	 */
	qos: boolean;
	/**
	 * state of silence warning notice
	 */
	silence_warning: boolean;
}

export interface RPCGetVoiceSettingsArgs {}

/**
 * Returns the [Get Channel](https://discord.com/developers/docs/topics/rpc#getchannel) response, or `null` if none.
 */
export type RPCSelectTextChannelResultData = RPCGetChannelResultData | null;
/**
 * https://discord.com/developers/docs/topics/rpc#selecttextchannel-select-text-channel-argument-structure
 */
export interface RPCSelectTextChannelArgs {
	/**
	 * channel id to join (or `null` to leave)
	 */
	channel_id: Snowflake | null;
	/**
	 * asynchronously join channel with time to wait before timing out
	 */
	timeout?: number;
}

export interface RPCSetActivityResultData {}
/**
 * https://discord.com/developers/docs/topics/rpc#setactivity-set-activity-argument-structure
 */
export interface RPCSetActivityArgs {
	/**
	 * the rich presence to assign to the user
	 */
	activity?: Partial<
		Omit<GatewayActivity, 'id' | 'created_at' | 'timestamps'> & Partial<Pick<GatewayActivity, 'timestamps'>>
	>;
	/**
	 * the application's process id
	 */
	pid: number;
}

/**
 * https://discord.com/developers/docs/topics/rpc#setvoicesettings-set-voice-settings-argument-and-response-structure
 */
export type RPCSetVoiceSettingsResultData = RPCGetVoiceSettingsResultData;
/**
 * https://discord.com/developers/docs/topics/rpc#setvoicesettings-set-voice-settings-argument-and-response-structure
 *
 * @note Discord only supports a single modifier of voice settings at a time over RPC. If an app changes voice settings, it will lock voice settings so that other apps connected simultaneously lose the ability to change voice settings. Settings reset to what they were before being changed after the controlling app disconnects. When an app that has previously set voice settings connects, the client will swap to that app's configured voice settings and lock voice settings again.
 */
export type RPCSetVoiceSettingsArgs = RPCGetVoiceSettingsResultData;

/**
 * https://discord.com/developers/docs/topics/rpc#subscribe-subscribe-response-structure
 */
export interface RPCSubscribeResultData {
	/**
	 * event name now subscribed to
	 */
	evt: RPCEvents;
}
/**
 * https://discord.com/developers/docs/topics/rpc#subscribe
 */
export type RPCSubscribeArgs =
	| RPCSubscribeActivityInviteArgs
	| RPCSubscribeActivityJoinArgs
	| RPCSubscribeActivityJoinRequestArgs
	| RPCSubscribeActivitySpectateArgs
	| RPCSubscribeCaptureShortcutChangeArgs
	| RPCSubscribeChannelCreateArgs
	| RPCSubscribeCurrentUserUpdateArgs
	| RPCSubscribeEntitlementCreateArgs
	| RPCSubscribeEntitlementDeleteArgs
	| RPCSubscribeGameJoinArgs
	| RPCSubscribeGameSpectateArgs
	| RPCSubscribeGuildCreateArgs
	| RPCSubscribeGuildStatusArgs
	| RPCSubscribeLobbyDeleteArgs
	| RPCSubscribeLobbyMemberConnectArgs
	| RPCSubscribeLobbyMemberDisconnectArgs
	| RPCSubscribeLobbyMemberUpdateArgs
	| RPCSubscribeLobbyMessageArgs
	| RPCSubscribeLobbyUpdateArgs
	| RPCSubscribeMessageCreateArgs
	| RPCSubscribeMessageDeleteArgs
	| RPCSubscribeMessageUpdateArgs
	| RPCSubscribeNotificationCreateArgs
	| RPCSubscribeOverlayArgs
	| RPCSubscribeOverlayUpdateArgs
	| RPCSubscribeRelationshipUpdateArgs
	| RPCSubscribeSpeakingStartArgs
	| RPCSubscribeSpeakingStopArgs
	| RPCSubscribeUserAchievementUpdateArgs
	| RPCSubscribeVoiceChannelSelectArgs
	| RPCSubscribeVoiceConnectionStatusArgs
	| RPCSubscribeVoiceSettingsUpdate2Args
	| RPCSubscribeVoiceSettingsUpdateArgs
	| RPCSubscribeVoiceStateCreateArgs
	| RPCSubscribeVoiceStateDeleteArgs
	| RPCSubscribeVoiceStateUpdateArgs;

/**
 * https://discord.com/developers/docs/topics/rpc#unsubscribe-unsubscribe-response-structure
 */
export interface RPCUnsubscribeResultData {
	/**
	 * event name now unsubscribed from
	 */
	evt: RPCEvents;
}
/**
 * https://discord.com/developers/docs/topics/rpc#unsubscribe
 */
export type RPCUnsubscribeArgs = RPCSubscribeArgs;

/**
 * @unstable
 */
export interface RPCAcceptActivityInviteResultData {}
/**
 * @unstable
 */
export interface RPCAcceptActivityInviteArgs {}

/**
 * @unstable
 */
export interface RPCActivityInviteUserResultData {}
/**
 * @unstable
 */
export interface RPCActivityInviteUserArgs {}

/**
 * @unstable
 */
export interface RPCBraintreePopupBridgeCallbackResultData {}
/**
 * @unstable
 */
export interface RPCBraintreePopupBridgeCallbackArgs {}

/**
 * @unstable
 */
export interface RPCBrowserHandoffResultData {}
/**
 * @unstable
 */
export interface RPCBrowserHandoffArgs {}

/**
 * @unstable
 */
export interface RPCCaptureShortcutResultData {}
/**
 * @unstable
 */
export interface RPCCaptureShortcutArgs {
	action: RPCCaptureShortcutAction;
}

export interface RPCCloseActivityRequestResultData {}
/**
 * https://discord.com/developers/docs/topics/rpc#closeactivityrequest-close-activity-request-argument-structure
 */
export interface RPCCloseActivityRequestArgs {
	/**
	 * the id of the requesting user
	 */
	user_id: Snowflake;
}

/**
 * @unstable
 */
export interface RPCConnectToLobbyResultData {}
/**
 * @unstable
 */
export interface RPCConnectToLobbyArgs {
	/**
	 * @unstable id of the lobby to connect to
	 */
	id: Snowflake;
	/**
	 * @unstable secret for the lobby
	 */
	secret: string;
}

/**
 * @unstable
 */
export interface RPCConnectToLobbyVoiceResultData {}
/**
 * @unstable
 */
export interface RPCConnectToLobbyVoiceArgs {}

/**
 * @unstable
 */
export interface RPCConnectionsCallbackResultData {}
/**
 * @unstable
 */
export interface RPCConnectionsCallbackArgs {}

/**
 * @unstable
 */
export interface RPCCreateChannelInviteResultData {}
/**
 * @unstable
 */
export interface RPCCreateChannelInviteArgs {}

/**
 * @unstable
 */
export interface RPCCreateLobbyResultData {}
/**
 * @unstable
 */
export interface RPCCreateLobbyArgs {}

/**
 * @unstable
 */
export interface RPCDeepLinkResultData {}
/**
 * @unstable
 */
export interface RPCDeepLinkArgs {}

/**
 * @unstable
 */
export interface RPCDeleteLobbyResultData {}
/**
 * @unstable
 */
export interface RPCDeleteLobbyArgs {}

/**
 * @unstable
 */
export interface RPCDisconnectFromLobbyResultData {}
/**
 * @unstable
 */
export interface RPCDisconnectFromLobbyArgs {}

/**
 * @unstable
 */
export interface RPCDisconnectFromLobbyVoiceResultData {}
/**
 * @unstable
 */
export interface RPCDisconnectFromLobbyVoiceArgs {}

/**
 * @unstable
 */
export interface RPCGetApplicationTicketResultData {}
/**
 * @unstable
 */
export interface RPCGetApplicationTicketArgs {}

/**
 * @unstable
 */
export interface RPCGetEntitlementTicketResultData {}
/**
 * @unstable
 */
export interface RPCGetEntitlementTicketArgs {}

/**
 * @unstable
 */
export interface RPCGetEntitlementsResultData {}
/**
 * @unstable
 */
export interface RPCGetEntitlementsArgs {}

/**
 * @unstable
 */
export interface RPCGetImageResultData {}
/**
 * @unstable
 */
export interface RPCGetImageArgs {}

/**
 * @unstable
 */
export interface RPCGetNetworkingConfigResultData {}
/**
 * @unstable
 */
export interface RPCGetNetworkingConfigArgs {}

/**
 * @unstable
 */
export type RPCGetRelationshipsResultData = Relationship[];
/**
 * @unstable
 */
export interface RPCGetRelationshipsArgs {}

/**
 * @unstable
 */
export interface RPCGetSkusResultData {}
/**
 * @unstable
 */
export interface RPCGetSkusArgs {}

/**
 * @unstable
 */
export interface RPCGetUserAchievementsResultData {}
/**
 * @unstable
 */
export interface RPCGetUserAchievementsArgs {}

/**
 * @unstable
 */
export interface RPCGiftCodeBrowserResultData {}
/**
 * @unstable
 */
export interface RPCGiftCodeBrowserArgs {}

/**
 * @unstable
 */
export interface RPCGuildTemplateBrowserResultData {}
/**
 * @unstable
 */
export interface RPCGuildTemplateBrowserArgs {}

/**
 * @unstable
 */
export interface RPCInviteBrowserResultData {}
/**
 * @unstable
 */
export interface RPCInviteBrowserArgs {}

/**
 * @unstable
 */
export interface RPCNetworkingCreateTokenResultData {}
/**
 * @unstable
 */
export interface RPCNetworkingCreateTokenArgs {}

/**
 * @unstable
 */
export interface RPCNetworkingPeerMetricsResultData {}
/**
 * @unstable
 */
export interface RPCNetworkingPeerMetricsArgs {}

/**
 * @unstable
 */
export interface RPCNetworkingSystemMetricsResultData {}
/**
 * @unstable
 */
export interface RPCNetworkingSystemMetricsArgs {}

/**
 * @unstable
 */
export interface RPCOpenOverlayActivityInviteResultData {}
/**
 * @unstable
 */
export interface RPCOpenOverlayActivityInviteArgs {}

/**
 * @unstable
 */
export interface RPCOpenOverlayGuildInviteResultData {}
/**
 * @unstable
 */
export interface RPCOpenOverlayGuildInviteArgs {}

/**
 * @unstable
 */
export interface RPCOpenOverlayVoiceSettingsResultData {}
/**
 * @unstable
 */
export interface RPCOpenOverlayVoiceSettingsArgs {}

/**
 * @unstable
 */
export interface RPCOverlayResultData {}
/**
 * @unstable
 */
export interface RPCOverlayArgs {}

/**
 * @unstable
 */
export interface RPCSearchLobbiesResultData {}
/**
 * @unstable
 */
export interface RPCSearchLobbiesArgs {}

export interface RPCSendActivityJoinInviteResultData {}
/**
 * https://discord.com/developers/docs/topics/rpc#sendactivityjoininvite-send-activity-join-invite-argument-structure
 */
export interface RPCSendActivityJoinInviteArgs {
	/**
	 * the id of the requesting user
	 */
	user_id: Snowflake;
}

/**
 * @unstable
 */
export interface RPCSendToLobbyResultData {}
/**
 * @unstable
 */
export interface RPCSendToLobbyArgs {
	/**
	 * @unstable id of the lobby to send to
	 */
	id: Snowflake;
	/**
	 * @unstable data to send
	 */
	data: unknown;
}

export type RPCSetCertifiedDevicesResultData = null;
/**
 * https://discord.com/developers/docs/topics/rpc#setcertifieddevices-set-certified-devices-argument-structure
 */
export interface RPCSetCertifiedDevicesArgs {
	/**
	 * a list of devices for your manufacturer, in order of priority
	 */
	devices: RPCCertifiedDevice[];
}

/**
 * @unstable
 */
export interface RPCSetOverlayLockedResultData {}
/**
 * @unstable
 */
export interface RPCSetOverlayLockedArgs {}

/**
 * @unstable
 */
export interface RPCSetUserAchievementResultData {}
/**
 * @unstable
 */
export interface RPCSetUserAchievementArgs {}

/**
 * @unstable
 */
export type RPCSetUserVoiceSettings2ResultData = RPCSetUserVoiceSettingsResultData;
/**
 * @unstable
 */
export type RPCSetUserVoiceSettings2Args = RPCSetUserVoiceSettingsArgs;

/**
 * @unstable
 */
export type RPCSetVoiceSettings2ResultData = RPCSetVoiceSettingsResultData;
/**
 * @unstable
 */
export type RPCSetVoiceSettings2Args = RPCSetVoiceSettingsArgs;

/**
 * @unstable
 */
export interface RPCStartPurchaseResultData {}
/**
 * @unstable
 */
export interface RPCStartPurchaseArgs {}

/**
 * @unstable
 */
export interface RPCUpdateLobbyResultData {}
/**
 * @unstable
 */
export interface RPCUpdateLobbyArgs {
	/**
	 * id of the lobby to update
	 */
	id: Snowflake;
	/**
	 * lobby type
	 */
	type?: LobbyType;
	/**
	 * id of the owner of the lobby
	 */
	owner_id?: Snowflake;
	/**
	 * capacity of the lobby
	 */
	capacity?: number;
	/**
	 * metadata for the lobby
	 */
	metadata?: RPCLobbyMetadata;
}

/**
 * @unstable
 */
export interface RPCUpdateLobbyMemberResultData {}
/**
 * @unstable
 */
export interface RPCUpdateLobbyMemberArgs {
	/**
	 * @unstable id of the lobby the member is from
	 */
	lobby_id: Snowflake;
	/**
	 * @unstable id of the member to update
	 */
	user_id: Snowflake;
	/**
	 * @unstable metadata for the member
	 */
	metadata?: RPCLobbyMetadata;
}

/**
 * @unstable
 */
export interface RPCValidateApplicationResultData {}
/**
 * @unstable
 */
export interface RPCValidateApplicationArgs {}

/**
 * https://discord.com/developers/docs/topics/rpc#commands-and-events-rpc-events
 */
export enum RPCEvents {
	/**
	 * @unstable
	 */
	ActivityInvite = 'ACTIVITY_INVITE',
	ActivityJoin = 'ACTIVITY_JOIN',
	ActivityJoinRequest = 'ACTIVITY_JOIN_REQUEST',
	ActivitySpectate = 'ACTIVITY_SPECTATE',
	ChannelCreate = 'CHANNEL_CREATE',
	CurrentUserUpdate = 'CURRENT_USER_UPDATE',
	/**
	 * @unstable
	 */
	EntitlementCreate = 'ENTITLEMENT_CREATE',
	/**
	 * @unstable
	 */
	EntitlementDelete = 'ENTITLEMENT_DELETE',
	Error = 'ERROR',
	/**
	 * @unstable
	 */
	GameJoin = 'GAME_JOIN',
	/**
	 * @unstable
	 */
	GameSpectate = 'GAME_SPECTATE',
	GuildCreate = 'GUILD_CREATE',
	GuildStatus = 'GUILD_STATUS',
	/**
	 * @unstable
	 */
	LobbyDelete = 'LOBBY_DELETE',
	/**
	 * @unstable
	 */
	LobbyMemberConnect = 'LOBBY_MEMBER_CONNECT',
	/**
	 * @unstable
	 */
	LobbyMemberDisconnect = 'LOBBY_MEMBER_DISCONNECT',
	/**
	 * @unstable
	 */
	LobbyMemberUpdate = 'LOBBY_MEMBER_UPDATE',
	/**
	 * @unstable
	 */
	LobbyMessage = 'LOBBY_MESSAGE',
	/**
	 * @unstable
	 */
	LobbyUpdate = 'LOBBY_UPDATE',
	/**
	 * Dispatches message objects, with the exception of deletions, which only contains the id in the message object.
	 */
	MessageCreate = 'MESSAGE_CREATE',
	/**
	 * Dispatches message objects, with the exception of deletions, which only contains the id in the message object.
	 */
	MessageDelete = 'MESSAGE_DELETE',
	/**
	 * Dispatches message objects, with the exception of deletions, which only contains the id in the message object.
	 */
	MessageUpdate = 'MESSAGE_UPDATE',
	/**
	 * This event requires the `rpc.notifications.read` [OAuth2 scope](https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes).
	 */
	NotificationCreate = 'NOTIFICATION_CREATE',
	/**
	 * @unstable
	 */
	Overlay = 'OVERLAY',
	/**
	 * @unstable
	 */
	OverlayUpdate = 'OVERLAY_UPDATE',
	Ready = 'READY',
	/**
	 * @unstable
	 */
	RelationshipUpdate = 'RELATIONSHIP_UPDATE',
	SpeakingStart = 'SPEAKING_START',
	SpeakingStop = 'SPEAKING_STOP',
	UserAchievementUpdate = 'USER_ACHIEVEMENT_UPDATE',
	VoiceChannelSelect = 'VOICE_CHANNEL_SELECT',
	VoiceConnectionStatus = 'VOICE_CONNECTION_STATUS',
	VoiceSettingsUpdate = 'VOICE_SETTINGS_UPDATE',
	/**
	 * @unstable
	 */
	VoiceSettingsUpdate2 = 'VOICE_SETTINGS_UPDATE_2',
	/**
	 * Dispatches channel voice state objects
	 */
	VoiceStateCreate = 'VOICE_STATE_CREATE',
	/**
	 * Dispatches channel voice state objects
	 */
	VoiceStateDelete = 'VOICE_STATE_DELETE',
	/**
	 * Dispatches channel voice state objects
	 */
	VoiceStateUpdate = 'VOICE_STATE_UPDATE',
}

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeActivityInviteArgs = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeActivityJoinArgs = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeActivityJoinRequestArgs = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeActivitySpectateArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeCaptureShortcutChangeArgs = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeChannelCreateArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeCurrentUserUpdateArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeEntitlementCreateArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeEntitlementDeleteArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeGameJoinArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeGameSpectateArgs = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeGuildCreateArgs = Record<string, never>;

/**
 * https://discord.com/developers/docs/topics/rpc#guildstatus-guild-status-argument-structure
 */
export interface RPCSubscribeGuildStatusArgs {
	/**
	 * id of guild to listen to updates of
	 */
	guild_id: Snowflake;
}

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeLobbyDeleteArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeLobbyMemberConnectArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeLobbyMemberDisconnectArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeLobbyMemberUpdateArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeLobbyMessageArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeLobbyUpdateArgs = Record<string, never>;

/**
 * https://discord.com/developers/docs/topics/rpc#messagecreatemessageupdatemessagedelete-message-argument-structure
 */
export interface RPCSubscribeMessageCreateArgs {
	/**
	 * id of channel to listen to updates of
	 */
	channel_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/topics/rpc#messagecreatemessageupdatemessagedelete-message-argument-structure
 */
export interface RPCSubscribeMessageDeleteArgs {
	/**
	 * id of channel to listen to updates of
	 */
	channel_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/topics/rpc#messagecreatemessageupdatemessagedelete-message-argument-structure
 */
export interface RPCSubscribeMessageUpdateArgs {
	/**
	 * id of channel to listen to updates of
	 */
	channel_id: Snowflake;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeNotificationCreateArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeOverlayArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeOverlayUpdateArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeRelationshipUpdateArgs = Record<string, never>;

/**
 * https://discord.com/developers/docs/topics/rpc#speakingstartspeakingstop-speaking-argument-structure
 */
export interface RPCSubscribeSpeakingStartArgs {
	/**
	 * id of channel to listen to updates of
	 */
	channel_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/topics/rpc#speakingstartspeakingstop-speaking-argument-structure
 */
export interface RPCSubscribeSpeakingStopArgs {
	/**
	 * id of channel to listen to updates of
	 */
	channel_id: Snowflake;
}

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeUserAchievementUpdateArgs = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeVoiceChannelSelectArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeVoiceConnectionStatusArgs = Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeVoiceSettingsUpdateArgs = Record<string, never>;

/**
 * @unstable
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type RPCSubscribeVoiceSettingsUpdate2Args = Record<string, never>;

/**
 * https://discord.com/developers/docs/topics/rpc#voicestatecreatevoicestateupdatevoicestatedelete-voice-state-argument-structure
 */
export interface RPCSubscribeVoiceStateCreateArgs {
	/**
	 * 	id of channel to listen to updates of
	 */
	channel_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/topics/rpc#voicestatecreatevoicestateupdatevoicestatedelete-voice-state-argument-structure
 */
export interface RPCSubscribeVoiceStateDeleteArgs {
	/**
	 * id of channel to listen to updates of
	 */
	channel_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/topics/rpc#voicestatecreatevoicestateupdatevoicestatedelete-voice-state-argument-structure
 */
export interface RPCSubscribeVoiceStateUpdateArgs {
	/**
	 * id of channel to listen to updates of
	 */
	channel_id: Snowflake;
}

/**
 * @unstable
 */

export interface RPCActivityInviteDispatchData {}

/**
 * https://discord.com/developers/docs/topics/rpc#activityjoin-activity-join-dispatch-data-structure
 */
export interface RPCActivityJoinDispatchData {
	/**
	 * the [`join_secret`](https://discord.com/developers/docs/developer-tools/game-sdk#activitysecrets-struct) for the given invite
	 */
	secret: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#activityjoinrequest-activity-join-request-data-structure
 */
export interface RPCActivityJoinRequestDispatchData {
	/**
	 * information about the user requesting to join
	 */
	user: APIUser;
}

/**
 * https://discord.com/developers/docs/topics/rpc#activityspectate-activity-spectate-dispatch-data-structure
 */
export interface RPCActivitySpectateDispatchData {
	/**
	 * the [`spectate_secret`](https://discord.com/developers/docs/developer-tools/game-sdk#activitysecrets-struct) for the given invite
	 */
	secret: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#channelcreate-channel-create-dispatch-data-structure
 */
export interface RPCChannelCreateDispatchData {
	/**
	 * channel id
	 */
	id: Snowflake;
	/**
	 * name of the channel
	 */
	name: string;
	/**
	 * channel type
	 */
	type: ChannelType;
}

/**
 * @unstable
 */

export type RPCCurrentUserUpdateDispatchData = APIUser;

/**
 * @unstable
 */

export interface RPCEntitlementCreateDispatchData {}

/**
 * @unstable
 */

export interface RPCEntitlementDeleteDispatchData {}

/**
 * https://discord.com/developers/docs/topics/rpc#error-error-data-structure
 */
export interface RPCErrorDispatchData {
	/**
	 * RPC Error Code
	 */
	code: RPCErrorCodes;
	/**
	 * Error description
	 */
	message: string;
}

/**
 * @unstable
 */
export interface RPCGameJoinDispatchData {}

/**
 * @unstable
 */
export interface RPCGameSpectateDispatchData {}

/**
 * https://discord.com/developers/docs/topics/rpc#guildcreate-guild-create-dispatch-data-structure
 */
export interface RPCGuildCreateDispatchData {
	/**
	 * guild id
	 */
	id: Snowflake;
	/**
	 * name of the guild
	 */
	name: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#guildstatus-guild-status-dispatch-data-structure
 */
export interface RPCGuildStatusDispatchData {
	/**
	 * guild with requested id
	 */
	guild: APIPartialGuild;
	/**
	 * number of online users in guild
	 *
	 * @deprecated This will always be 0
	 */
	online: number;
}

/**
 * @unstable
 */
export interface RPCLobbyDeleteDispatchData {}

/**
 * @unstable
 */
export interface RPCLobbyMemberConnectDispatchData {}

/**
 * @unstable
 */
export interface RPCLobbyMemberDisconnectDispatchData {}

/**
 * @unstable
 */
export interface RPCLobbyMemberUpdateDispatchData {}

/**
 * @unstable
 */
export interface RPCLobbyMessageDispatchData {}

/**
 * @unstable
 */
export interface RPCLobbyUpdateDispatchData {}

/**
 * https://discord.com/developers/docs/topics/rpc#messagecreatemessageupdatemessagedelete-example-message-dispatch-payload
 */
export interface RPCMessageCreateDispatchData {
	/**
	 * id of channel where message was sent
	 */
	channel_id: Snowflake;
	/**
	 * 	message that was created
	 */
	message: RPCAPIMessage;
}

/**
 * https://discord.com/developers/docs/topics/rpc#messagecreatemessageupdatemessagedelete-example-message-dispatch-payload
 */
export interface RPCMessageDeleteDispatchData {
	/**
	 * id of channel where message was deleted
	 */
	channel_id: Snowflake;
	/**
	 * message that was deleted (only id)
	 */
	message: Pick<APIMessage, 'id'>;
}

/**
 * https://discord.com/developers/docs/topics/rpc#messagecreatemessageupdatemessagedelete-example-message-dispatch-payload
 */
export interface RPCMessageUpdateDispatchData {
	/**
	 * id of channel where message was updated
	 */
	channel_id: Snowflake;
	/**
	 * 	message that was updated
	 */
	message: APIMessage;
}

/**
 * https://discord.com/developers/docs/topics/rpc#notificationcreate-notification-create-dispatch-data-structure
 */
export interface RPCNotificationCreateDispatchData {
	/**
	 * body of the notification
	 */
	body: string;
	/**
	 * id of channel where notification occurred
	 */
	channel_id: Snowflake;
	/**
	 * icon url of the notification
	 */
	icon_url: string;
	/**
	 * message that generated this notification
	 */
	message: APIMessage;
	/**
	 * title of the notification
	 */
	title: string;
}

/**
 * @unstable
 */
export interface RPCOverlayDispatchData {}

/**
 * @unstable
 */
export interface RPCOverlayUpdateDispatchData {}

/**
 * https://discord.com/developers/docs/topics/rpc#ready-rpc-server-configuration-object
 */
export interface RPCServerConfiguration {
	/**
	 * server's api endpoint
	 */
	api_endpoint: string;
	/**
	 * server's cdn
	 */
	cdn_host: string;
	/**
	 * server's environment
	 */
	environment: string;
}

/**
 * https://discord.com/developers/docs/topics/rpc#ready-ready-dispatch-data-structure
 */
export interface RPCReadyDispatchData {
	/**
	 * server configuration
	 */
	config: RPCServerConfiguration;
	/**
	 * the user to whom you are connected
	 */
	user: APIUser;
	/**
	 * RPC version
	 */
	v: 1;
}

/**
 * @unstable
 */
export interface RPCRelationshipUpdateDispatchData {}

/**
 * https://discord.com/developers/docs/topics/rpc#speakingstartspeakingstop-speaking-dispatch-data-structure
 */
export interface RPCSpeakingStartDispatchData {
	/**
	 * id of user who started speaking
	 */
	user_id: Snowflake;
	/**
	 * @unstable
	 * id of channel where user is speaking
	 */
	channel_id: Snowflake;
}

/**
 * https://discord.com/developers/docs/topics/rpc#speakingstartspeakingstop-speaking-dispatch-data-structure
 */
export interface RPCSpeakingStopDispatchData {
	/**
	 * id of user who stopped speaking
	 */
	user_id: Snowflake;
	/**
	 * @unstable
	 * id of channel where user is speaking
	 */
	channel_id: Snowflake;
}

/**
 * @unstable
 */
export interface RPCUserAchievementUpdateDispatchData {}

/**
 * https://discord.com/developers/docs/topics/rpc#voicechannelselect-voice-channel-select-dispatch-data-structure
 */
export interface RPCVoiceChannelSelectDispatchData {
	/**
	 * id of channel (`null` if none)
	 */
	channel_id: Snowflake | null;
	/**
	 * id of guild (`null` if none)
	 */
	guild_id: Snowflake | null;
}

/**
 * https://discord.com/developers/docs/topics/rpc#voiceconnectionstatus-voice-connection-status-dispatch-data-structure
 */
export interface RPCVoiceConnectionStatusDispatchData {
	/**
	 * average ping (in ms)
	 */
	average_ping: number;
	/**
	 * hostname of the connected voice server
	 */
	hostname: string;
	/**
	 * last ping (in ms)
	 */
	last_ping: number;
	/**
	 * last 20 pings (in ms)
	 */
	pings: number[];
	/**
	 * voice connection states
	 */
	state: VoiceConnectionStates;
}

export type RPCVoiceSettingsUpdateDispatchData = RPCGetVoiceSettingsResultData;

/**
 * @unstable
 */
export type RPCVoiceSettingsUpdate2DispatchData = RPCGetVoiceSettingsResultData;

/**
 * https://discord.com/developers/docs/topics/rpc#voicestatecreatevoicestateupdatevoicestatedelete-example-voice-state-dispatch-payload
 */
export interface RPCVoiceStateCreateDispatchData {
	/**
	 * is user muted for the client user
	 */
	mute: boolean;
	/**
	 * nickname of user
	 */
	nick: string;
	/**
	 * pan of user
	 */
	pan: RPCVoicePan;
	/**
	 * user who joined voice channel
	 */
	user: APIUser;
	/**
	 * voice state of user
	 */
	voice_state: APIVoiceState;
	/**
	 * volume of user
	 */
	volume: number;
}

/**
 * https://discord.com/developers/docs/topics/rpc#voicestatecreatevoicestateupdatevoicestatedelete-example-voice-state-dispatch-payload
 */
export interface RPCVoiceStateDeleteDispatchData {
	/**
	 * is user muted for the client user
	 */
	mute: boolean;
	/**
	 * nickname of user
	 */
	nick: string;
	/**
	 * pan of user
	 */
	pan: RPCVoicePan;
	/**
	 * user who joined voice channel
	 */
	user: APIUser;
	/**
	 * voice state of user
	 */
	voice_state: APIVoiceState;
	/**
	 * volume of user
	 */
	volume: number;
}

/**
 * https://discord.com/developers/docs/topics/rpc#voicestatecreatevoicestateupdatevoicestatedelete-example-voice-state-dispatch-payload
 */
export interface RPCVoiceStateUpdateDispatchData {
	/**
	 * is user muted for the client user
	 */
	mute: boolean;
	/**
	 * nickname of user
	 */
	nick: string;
	/**
	 * pan of user
	 */
	pan: RPCVoicePan;
	/**
	 * user who joined voice channel
	 */
	user: APIUser;
	/**
	 * voice state of user
	 */
	voice_state: APIVoiceState;
	/**
	 * volume of user
	 */
	volume: number;
}

export interface BaseRPCMessage<Cmd extends RPCCommands> {
	cmd: Cmd;
}

export interface RPCCommandMessage<Cmd extends RPCCommands> extends BaseRPCMessage<Cmd> {
	nonce: string;
}

export interface RPCSubscribeMessage<
	Evt extends RPCEvents,
	Cmd extends RPCCommands.Subscribe | RPCCommands.Unsubscribe = RPCCommands.Subscribe | RPCCommands.Unsubscribe,
> extends RPCCommandMessage<Cmd> {
	evt: Evt;
}

export interface RPCCommandAuthorizePayload extends RPCCommandMessage<RPCCommands.Authorize> {
	args: RPCAuthorizeArgs;
}

export interface RPCCommandAuthenticatePayload extends RPCCommandMessage<RPCCommands.Authenticate> {
	args: RPCAuthenticateArgs;
}

export interface RPCCommandGetChannelPayload extends RPCCommandMessage<RPCCommands.GetChannel> {
	args: RPCGetChannelArgs;
}

export interface RPCCommandGetChannelsPayload extends RPCCommandMessage<RPCCommands.GetChannels> {
	args: RPCGetChannelsArgs;
}

export interface RPCCommandGetGuildPayload extends RPCCommandMessage<RPCCommands.GetGuild> {
	args: RPCGetGuildArgs;
}

export interface RPCCommandGetGuildsPayload extends RPCCommandMessage<RPCCommands.GetGuilds> {
	args: RPCGetGuildsArgs;
}

export interface RPCCommandGetUserPayload extends RPCCommandMessage<RPCCommands.GetUser> {
	args: RPCGetUserArgs;
}

export interface RPCCommandGetVoiceSettingsPayload extends RPCCommandMessage<RPCCommands.GetVoiceSettings> {
	args: RPCGetVoiceSettingsArgs;
}

export interface RPCCommandSelectTextChannelPayload extends RPCCommandMessage<RPCCommands.SelectTextChannel> {
	args: RPCSelectTextChannelArgs;
}

export interface RPCCommandSelectVoiceChannelPayload extends RPCCommandMessage<RPCCommands.SelectVoiceChannel> {
	args: RPCSelectVoiceChannelArgs;
}

export interface RPCCommandSetActivityPayload extends RPCCommandMessage<RPCCommands.SetActivity> {
	args: RPCSetActivityArgs;
}

export interface RPCCommandSetVoiceSettingsPayload extends RPCCommandMessage<RPCCommands.SetVoiceSettings> {
	args: RPCSetVoiceSettingsArgs;
}

export type RPCCommandSubscribePayload =
	| RPCSubscribeActivityInvite
	| RPCSubscribeActivityJoin
	| RPCSubscribeActivityJoinRequest
	| RPCSubscribeActivitySpectate
	| RPCSubscribeChannelCreate
	| RPCSubscribeCurrentUserUpdate
	| RPCSubscribeEntitlementCreate
	| RPCSubscribeEntitlementDelete
	| RPCSubscribeGameJoin
	| RPCSubscribeGameSpectate
	| RPCSubscribeGuildCreate
	| RPCSubscribeGuildStatus
	| RPCSubscribeLobbyDelete
	| RPCSubscribeLobbyMemberConnect
	| RPCSubscribeLobbyMemberDisconnect
	| RPCSubscribeLobbyMemberUpdate
	| RPCSubscribeLobbyMessage
	| RPCSubscribeLobbyUpdate
	| RPCSubscribeMessageCreate
	| RPCSubscribeMessageDelete
	| RPCSubscribeMessageUpdate
	| RPCSubscribeNotificationCreate
	| RPCSubscribeOverlay
	| RPCSubscribeOverlayUpdate
	| RPCSubscribeRelationshipUpdate
	| RPCSubscribeSpeakingStart
	| RPCSubscribeSpeakingStop
	| RPCSubscribeUserAchievementUpdate
	| RPCSubscribeVoiceChannelSelect
	| RPCSubscribeVoiceConnectionStatus
	| RPCSubscribeVoiceSettingsUpdate
	| RPCSubscribeVoiceSettingsUpdate2
	| RPCSubscribeVoiceStateCreate
	| RPCSubscribeVoiceStateDelete
	| RPCSubscribeVoiceStateUpdate;

export type RPCCommandUnsubscribePayload = RPCCommandSubscribePayload;

export interface RPCCommandAcceptActivityInvitePayload extends RPCCommandMessage<RPCCommands.AcceptActivityInvite> {
	args: RPCAcceptActivityInviteArgs;
}

export interface RPCCommandActivityInviteUserPayload extends RPCCommandMessage<RPCCommands.ActivityInviteUser> {
	args: RPCActivityInviteUserArgs;
}

export interface RPCCommandBraintreePopupBridgeCallbackPayload
	extends RPCCommandMessage<RPCCommands.BraintreePopupBridgeCallback> {
	args: RPCBraintreePopupBridgeCallbackArgs;
}

export interface RPCCommandBrowserPayload extends RPCCommandMessage<RPCCommands.BrowserHandoff> {
	args: RPCBrowserHandoffArgs;
}

export interface RPCCommandCaptureShortcutPayload extends RPCCommandMessage<RPCCommands.CaptureShortcut> {
	args: RPCCaptureShortcutArgs;
}

export interface RPCCommandCloseActivityJoinRequestPayload
	extends RPCCommandMessage<RPCCommands.CloseActivityJoinRequest> {
	args: RPCCloseActivityRequestArgs;
}

export interface RPCCommandConnectToLobbyPayload extends RPCCommandMessage<RPCCommands.ConnectToLobby> {
	args: RPCConnectToLobbyArgs;
}

export interface RPCCommandConnectToLobbyVoicePayload extends RPCCommandMessage<RPCCommands.ConnectToLobbyVoice> {
	args: RPCConnectToLobbyVoiceArgs;
}

export interface RPCCommandConnectionsCallbackPayload extends RPCCommandMessage<RPCCommands.ConnectionsCallback> {
	args: RPCConnectionsCallbackArgs;
}

export interface RPCCommandCreateChannelInvitePayload extends RPCCommandMessage<RPCCommands.CreateChannelInvite> {
	args: RPCCreateChannelInviteArgs;
}

export interface RPCCommandCreateLobbyPayload extends RPCCommandMessage<RPCCommands.CreateLobby> {
	args: RPCCreateLobbyArgs;
}

export interface RPCCommandDeepLinkPayload extends RPCCommandMessage<RPCCommands.DeepLink> {
	args: RPCDeepLinkArgs;
}

export interface RPCCommandDeleteLobbyPayload extends RPCCommandMessage<RPCCommands.DeleteLobby> {
	args: RPCDeleteLobbyArgs;
}

export interface RPCCommandDisconnectFromLobbyPayload extends RPCCommandMessage<RPCCommands.DisconnectFromLobby> {
	args: RPCDisconnectFromLobbyArgs;
}

export interface RPCCommandDisconnectFromLobbyVoicePayload
	extends RPCCommandMessage<RPCCommands.DisconnectFromLobbyVoice> {
	args: RPCDisconnectFromLobbyVoiceArgs;
}

export interface RPCCommandGetApplicationTicketPayload extends RPCCommandMessage<RPCCommands.GetApplicationTicket> {
	args: RPCGetApplicationTicketArgs;
}

export interface RPCCommandGetEntitlementTicketPayload extends RPCCommandMessage<RPCCommands.GetEntitlementTicket> {
	args: RPCGetEntitlementTicketArgs;
}

export interface RPCCommandGetEntitlementsPayload extends RPCCommandMessage<RPCCommands.GetEntitlements> {
	args: RPCGetEntitlementsArgs;
}

export interface RPCCommandGetImagePayload extends RPCCommandMessage<RPCCommands.GetImage> {
	args: RPCGetImageArgs;
}

export interface RPCCommandGetNetworkingConfigPayload extends RPCCommandMessage<RPCCommands.GetNetworkingConfig> {
	args: RPCGetNetworkingConfigArgs;
}

export interface RPCCommandGetRelationshipsPayload extends RPCCommandMessage<RPCCommands.GetRelationships> {
	args: RPCGetRelationshipsArgs;
}

export interface RPCCommandGetSelectedVoiceChannelPayload
	extends RPCCommandMessage<RPCCommands.GetSelectedVoiceChannel> {
	args: RPCGetSelectedVoiceChannelArgs;
}

export interface RPCCommandGetSkusPayload extends RPCCommandMessage<RPCCommands.GetSkus> {
	args: RPCGetSkusArgs;
}

export interface RPCCommandGetUserAchievementsPayload extends RPCCommandMessage<RPCCommands.GetUserAchievements> {
	args: RPCGetUserAchievementsArgs;
}

export interface RPCCommandGiftCodeBrowserPayload extends RPCCommandMessage<RPCCommands.GiftCodeBrowser> {
	args: RPCGiftCodeBrowserArgs;
}

export interface RPCCommandGuildTemplateBrowserPayload extends RPCCommandMessage<RPCCommands.GuildTemplateBrowser> {
	args: RPCGuildTemplateBrowserArgs;
}

export interface RPCCommandInviteBrowserPayload extends RPCCommandMessage<RPCCommands.InviteBrowser> {
	args: RPCInviteBrowserArgs;
}

export interface RPCCommandNetworkingCreateTokenPayload extends RPCCommandMessage<RPCCommands.NetworkingCreateToken> {
	args: RPCNetworkingCreateTokenArgs;
}

export interface RPCCommandNetworkingPeerMetricsPayload extends RPCCommandMessage<RPCCommands.NetworkingPeerMetrics> {
	args: RPCNetworkingPeerMetricsArgs;
}

export interface RPCCommandNetworkingSystemMetricsPayload
	extends RPCCommandMessage<RPCCommands.NetworkingSystemMetrics> {
	args: RPCNetworkingSystemMetricsArgs;
}

export interface RPCCommandOpenOverlayActivityInvitePayload
	extends RPCCommandMessage<RPCCommands.OpenOverlayActivityInvite> {
	args: RPCOpenOverlayActivityInviteArgs;
}

export interface RPCCommandOpenOverlayGuildInvitePayload extends RPCCommandMessage<RPCCommands.OpenOverlayGuildInvite> {
	args: RPCOpenOverlayGuildInviteArgs;
}

export interface RPCCommandOpenOverlayVoiceSettingsPayload
	extends RPCCommandMessage<RPCCommands.OpenOverlayVoiceSettings> {
	args: RPCOpenOverlayVoiceSettingsArgs;
}

export interface RPCCommandOverlayPayload extends RPCCommandMessage<RPCCommands.Overlay> {
	args: RPCOverlayArgs;
}

export interface RPCCommandSearchLobbiesPayload extends RPCCommandMessage<RPCCommands.SearchLobbies> {
	args: RPCSearchLobbiesArgs;
}

export interface RPCCommandSendActivityJoinInvitePayload extends RPCCommandMessage<RPCCommands.SendActivityJoinInvite> {
	args: RPCSendActivityJoinInviteArgs;
}

export interface RPCCommandSendToLobbyPayload extends RPCCommandMessage<RPCCommands.SendToLobby> {
	args: RPCSendToLobbyArgs;
}

export interface RPCCommandSetCertifiedDevicesPayload extends RPCCommandMessage<RPCCommands.SetCertifiedDevices> {
	args: RPCSetCertifiedDevicesArgs;
}

export interface RPCCommandSetOverlayLockedPayload extends RPCCommandMessage<RPCCommands.SetOverlayLocked> {
	args: RPCSetOverlayLockedArgs;
}

export interface RPCCommandSetUserAchievementPayload extends RPCCommandMessage<RPCCommands.SetUserAchievement> {
	args: RPCSetUserAchievementArgs;
}

export interface RPCCommandSetUserVoiceSettingsPayload extends RPCCommandMessage<RPCCommands.SetUserVoiceSettings> {
	args: RPCSetUserVoiceSettingsArgs;
}

export interface RPCCommandSetUserVoiceSettings2Payload extends RPCCommandMessage<RPCCommands.SetUserVoiceSettings2> {
	args: RPCSetUserVoiceSettings2Args;
}

export interface RPCCommandSetVoiceSettings2Payload extends RPCCommandMessage<RPCCommands.SetVoiceSettings2> {
	args: RPCSetVoiceSettings2Args;
}

export interface RPCCommandStartPurchasePayload extends RPCCommandMessage<RPCCommands.StartPurchase> {
	args: RPCStartPurchaseArgs;
}

export interface RPCCommandUpdateLobbyPayload extends RPCCommandMessage<RPCCommands.UpdateLobby> {
	args: RPCUpdateLobbyArgs;
}

export interface RPCCommandUpdateLobbyMemberPayload extends RPCCommandMessage<RPCCommands.UpdateLobbyMember> {
	args: RPCUpdateLobbyMemberArgs;
}

export interface RPCCommandValidateApplicationPayload extends RPCCommandMessage<RPCCommands.ValidateApplication> {
	args: RPCValidateApplicationArgs;
}

export interface RPCSubscribeActivityInvite extends RPCSubscribeMessage<RPCEvents.ActivityInvite> {
	args: RPCSubscribeActivityInviteArgs;
	evt: RPCEvents.ActivityInvite;
}

export interface RPCSubscribeActivityJoin extends RPCSubscribeMessage<RPCEvents.ActivityJoin> {
	args: RPCSubscribeActivityJoinArgs;
	evt: RPCEvents.ActivityJoin;
}

export interface RPCSubscribeActivityJoinRequest extends RPCSubscribeMessage<RPCEvents.ActivityJoinRequest> {
	args: RPCSubscribeActivityJoinRequestArgs;
	evt: RPCEvents.ActivityJoinRequest;
}

export interface RPCSubscribeActivitySpectate extends RPCSubscribeMessage<RPCEvents.ActivitySpectate> {
	args: RPCSubscribeActivitySpectateArgs;
	evt: RPCEvents.ActivitySpectate;
}

export interface RPCSubscribeChannelCreate extends RPCSubscribeMessage<RPCEvents.ChannelCreate> {
	args: RPCSubscribeChannelCreateArgs;
	evt: RPCEvents.ChannelCreate;
}

export interface RPCSubscribeCurrentUserUpdate extends RPCSubscribeMessage<RPCEvents.CurrentUserUpdate> {
	args: RPCSubscribeCurrentUserUpdateArgs;
	evt: RPCEvents.CurrentUserUpdate;
}

export interface RPCSubscribeEntitlementCreate extends RPCSubscribeMessage<RPCEvents.EntitlementCreate> {
	args: RPCSubscribeEntitlementCreateArgs;
	evt: RPCEvents.EntitlementCreate;
}

export interface RPCSubscribeEntitlementDelete extends RPCSubscribeMessage<RPCEvents.EntitlementDelete> {
	args: RPCSubscribeEntitlementDeleteArgs;
	evt: RPCEvents.EntitlementDelete;
}

export interface RPCSubscribeGameJoin extends RPCSubscribeMessage<RPCEvents.GameJoin> {
	args: RPCSubscribeGameJoinArgs;
	evt: RPCEvents.GameJoin;
}

export interface RPCSubscribeGameSpectate extends RPCSubscribeMessage<RPCEvents.GameSpectate> {
	args: RPCSubscribeGameSpectateArgs;
	evt: RPCEvents.GameSpectate;
}

export interface RPCSubscribeGuildCreate extends RPCSubscribeMessage<RPCEvents.GuildCreate> {
	args: RPCSubscribeGuildCreateArgs;
	evt: RPCEvents.GuildCreate;
}

export interface RPCSubscribeGuildStatus extends RPCSubscribeMessage<RPCEvents.GuildStatus> {
	args: RPCSubscribeGuildStatusArgs;
	evt: RPCEvents.GuildStatus;
}

export interface RPCSubscribeLobbyDelete extends RPCSubscribeMessage<RPCEvents.LobbyDelete> {
	args: RPCSubscribeLobbyDeleteArgs;
	evt: RPCEvents.LobbyDelete;
}

export interface RPCSubscribeLobbyMemberConnect extends RPCSubscribeMessage<RPCEvents.LobbyMemberConnect> {
	args: RPCSubscribeLobbyMemberConnectArgs;
	evt: RPCEvents.LobbyMemberConnect;
}

export interface RPCSubscribeLobbyMemberDisconnect extends RPCSubscribeMessage<RPCEvents.LobbyMemberDisconnect> {
	args: RPCSubscribeLobbyMemberDisconnectArgs;
	evt: RPCEvents.LobbyMemberDisconnect;
}

export interface RPCSubscribeLobbyMemberUpdate extends RPCSubscribeMessage<RPCEvents.LobbyMemberUpdate> {
	args: RPCSubscribeLobbyMemberUpdateArgs;
	evt: RPCEvents.LobbyMemberUpdate;
}

export interface RPCSubscribeLobbyMessage extends RPCSubscribeMessage<RPCEvents.LobbyMessage> {
	args: RPCSubscribeLobbyMessageArgs;
	evt: RPCEvents.LobbyMessage;
}

export interface RPCSubscribeLobbyUpdate extends RPCSubscribeMessage<RPCEvents.LobbyUpdate> {
	args: RPCSubscribeLobbyUpdateArgs;
	evt: RPCEvents.LobbyUpdate;
}

export interface RPCSubscribeMessageCreate extends RPCSubscribeMessage<RPCEvents.MessageCreate> {
	args: RPCSubscribeMessageCreateArgs;
	evt: RPCEvents.MessageCreate;
}

export interface RPCSubscribeMessageDelete extends RPCSubscribeMessage<RPCEvents.MessageDelete> {
	args: RPCSubscribeMessageDeleteArgs;
	evt: RPCEvents.MessageDelete;
}

export interface RPCSubscribeMessageUpdate extends RPCSubscribeMessage<RPCEvents.MessageUpdate> {
	args: RPCSubscribeMessageUpdateArgs;
	evt: RPCEvents.MessageUpdate;
}

export interface RPCSubscribeNotificationCreate extends RPCSubscribeMessage<RPCEvents.NotificationCreate> {
	args: RPCSubscribeNotificationCreateArgs;
	evt: RPCEvents.NotificationCreate;
}

export interface RPCSubscribeOverlay extends RPCSubscribeMessage<RPCEvents.Overlay> {
	args: RPCSubscribeOverlayArgs;
	evt: RPCEvents.Overlay;
}

export interface RPCSubscribeOverlayUpdate extends RPCSubscribeMessage<RPCEvents.OverlayUpdate> {
	args: RPCSubscribeOverlayUpdateArgs;
	evt: RPCEvents.OverlayUpdate;
}

export interface RPCSubscribeRelationshipUpdate extends RPCSubscribeMessage<RPCEvents.RelationshipUpdate> {
	args: RPCSubscribeRelationshipUpdateArgs;
	evt: RPCEvents.RelationshipUpdate;
}

export interface RPCSubscribeSpeakingStart extends RPCSubscribeMessage<RPCEvents.SpeakingStart> {
	args: RPCSubscribeSpeakingStartArgs;
	evt: RPCEvents.SpeakingStart;
}

export interface RPCSubscribeSpeakingStop extends RPCSubscribeMessage<RPCEvents.SpeakingStop> {
	args: RPCSubscribeSpeakingStopArgs;
	evt: RPCEvents.SpeakingStop;
}

export interface RPCSubscribeUserAchievementUpdate extends RPCSubscribeMessage<RPCEvents.UserAchievementUpdate> {
	args: RPCSubscribeUserAchievementUpdateArgs;
	evt: RPCEvents.UserAchievementUpdate;
}

export interface RPCSubscribeVoiceChannelSelect extends RPCSubscribeMessage<RPCEvents.VoiceChannelSelect> {
	args: RPCSubscribeVoiceChannelSelectArgs;
	evt: RPCEvents.VoiceChannelSelect;
}

export interface RPCSubscribeVoiceConnectionStatus extends RPCSubscribeMessage<RPCEvents.VoiceConnectionStatus> {
	args: RPCSubscribeVoiceConnectionStatusArgs;
	evt: RPCEvents.VoiceConnectionStatus;
}

export interface RPCSubscribeVoiceSettingsUpdate extends RPCSubscribeMessage<RPCEvents.VoiceSettingsUpdate> {
	args: RPCSubscribeVoiceSettingsUpdateArgs;
	evt: RPCEvents.VoiceSettingsUpdate;
}

export interface RPCSubscribeVoiceSettingsUpdate2 extends RPCSubscribeMessage<RPCEvents.VoiceSettingsUpdate2> {
	args: RPCSubscribeVoiceSettingsUpdate2Args;
	evt: RPCEvents.VoiceSettingsUpdate2;
}

export interface RPCSubscribeVoiceStateCreate extends RPCSubscribeMessage<RPCEvents.VoiceStateCreate> {
	args: RPCSubscribeVoiceStateCreateArgs;
	evt: RPCEvents.VoiceStateCreate;
}

export interface RPCSubscribeVoiceStateDelete extends RPCSubscribeMessage<RPCEvents.VoiceStateDelete> {
	args: RPCSubscribeVoiceStateDeleteArgs;
	evt: RPCEvents.VoiceStateDelete;
}

export interface RPCSubscribeVoiceStateUpdate extends RPCSubscribeMessage<RPCEvents.VoiceStateUpdate> {
	args: RPCSubscribeVoiceStateUpdateArgs;
	evt: RPCEvents.VoiceStateUpdate;
}

export interface RPCAuthorizeResult extends RPCCommandMessage<RPCCommands.Authorize> {
	data: RPCAuthorizeResultData;
}

export interface RPCAuthenticateResult extends RPCCommandMessage<RPCCommands.Authenticate> {
	data: RPCAuthenticateResultData;
}

export interface RPCGetChannelResult extends RPCCommandMessage<RPCCommands.GetChannel> {
	data: RPCGetChannelResultData;
}

export interface RPCGetChannelsResult extends RPCCommandMessage<RPCCommands.GetChannels> {
	data: RPCGetChannelsResultData;
}

export interface RPCGetGuildResult extends RPCCommandMessage<RPCCommands.GetGuild> {
	data: RPCGetGuildResultData;
}

export interface RPCGetGuildsResult extends RPCCommandMessage<RPCCommands.GetGuilds> {
	data: RPCGetGuildsResultData;
}

export interface RPCGetUserResult extends RPCCommandMessage<RPCCommands.GetUser> {
	data: RPCGetUserResultData;
}

export interface RPCGetVoiceSettingsResult extends RPCCommandMessage<RPCCommands.GetVoiceSettings> {
	data: RPCGetVoiceSettingsResultData;
}

export interface RPCSelectTextChannelResult extends RPCCommandMessage<RPCCommands.SelectTextChannel> {
	data: RPCSelectTextChannelResultData;
}

export interface RPCSelectVoiceChannelResult extends RPCCommandMessage<RPCCommands.SelectVoiceChannel> {
	data: RPCSelectVoiceChannelResultData;
}

export interface RPCSetActivityResult extends RPCCommandMessage<RPCCommands.SetActivity> {
	data: RPCSetActivityResultData;
}

export interface RPCSetVoiceSettingsResult extends RPCCommandMessage<RPCCommands.SetVoiceSettings> {
	data: RPCSetVoiceSettingsResultData;
}

export interface RPCSubscribeResult extends RPCCommandMessage<RPCCommands.Subscribe> {
	data: RPCSubscribeResultData;
}

export interface RPCUnsubscribeResult extends RPCCommandMessage<RPCCommands.Unsubscribe> {
	data: RPCUnsubscribeResultData;
}

export interface RPCAcceptActivityInviteResult extends RPCCommandMessage<RPCCommands.AcceptActivityInvite> {
	data: RPCAcceptActivityInviteResultData;
}

export interface RPCActivityInviteUserResult extends RPCCommandMessage<RPCCommands.ActivityInviteUser> {
	data: RPCActivityInviteUserResultData;
}

export interface RPCBraintreePopupBridgeCallbackResult
	extends RPCCommandMessage<RPCCommands.BraintreePopupBridgeCallback> {
	data: RPCBraintreePopupBridgeCallbackResultData;
}

export interface RPCBrowserResult extends RPCCommandMessage<RPCCommands.BrowserHandoff> {
	data: RPCBrowserHandoffResultData;
}

export interface RPCCaptureShortcutResult extends RPCCommandMessage<RPCCommands.CaptureShortcut> {
	data: RPCCaptureShortcutResultData;
}

export interface RPCCloseActivityRequestResult extends RPCCommandMessage<RPCCommands.CloseActivityJoinRequest> {
	data: RPCCloseActivityRequestResultData;
}

export interface RPCConnectToLobbyResult extends RPCCommandMessage<RPCCommands.ConnectToLobby> {
	data: RPCConnectToLobbyResultData;
}

export interface RPCConnectToLobbyVoiceResult extends RPCCommandMessage<RPCCommands.ConnectToLobbyVoice> {
	data: RPCConnectToLobbyVoiceResultData;
}

export interface RPCConnectionsCallbackResult extends RPCCommandMessage<RPCCommands.ConnectionsCallback> {
	data: RPCConnectionsCallbackResultData;
}

export interface RPCCreateChannelInviteResult extends RPCCommandMessage<RPCCommands.CreateChannelInvite> {
	data: RPCCreateChannelInviteResultData;
}

export interface RPCCreateLobbyResult extends RPCCommandMessage<RPCCommands.CreateLobby> {
	data: RPCCreateLobbyResultData;
}

export interface RPCDeepLinkResult extends RPCCommandMessage<RPCCommands.DeepLink> {
	data: RPCDeepLinkResultData;
}

export interface RPCDeleteLobbyResult extends RPCCommandMessage<RPCCommands.DeleteLobby> {
	data: RPCDeleteLobbyResultData;
}

export interface RPCDisconnectFromLobbyResult extends RPCCommandMessage<RPCCommands.DisconnectFromLobby> {
	data: RPCDisconnectFromLobbyResultData;
}

export interface RPCDisconnectFromLobbyVoiceResult extends RPCCommandMessage<RPCCommands.DisconnectFromLobbyVoice> {
	data: RPCDisconnectFromLobbyVoiceResultData;
}

export interface RPCGetApplicationTicketResult extends RPCCommandMessage<RPCCommands.GetApplicationTicket> {
	data: RPCGetApplicationTicketResultData;
}

export interface RPCGetEntitlementTicketResult extends RPCCommandMessage<RPCCommands.GetEntitlementTicket> {
	data: RPCGetEntitlementTicketResultData;
}

export interface RPCGetEntitlementsResult extends RPCCommandMessage<RPCCommands.GetEntitlements> {
	data: RPCGetEntitlementsResultData;
}

export interface RPCGetImageResult extends RPCCommandMessage<RPCCommands.GetImage> {
	data: RPCGetImageResultData;
}

export interface RPCGetNetworkingConfigResult extends RPCCommandMessage<RPCCommands.GetNetworkingConfig> {
	data: RPCGetNetworkingConfigResultData;
}

export interface RPCGetRelationshipsResult extends RPCCommandMessage<RPCCommands.GetRelationships> {
	data: RPCGetRelationshipsResultData;
}

export interface RPCGetSelectedVoiceChannelResult extends RPCCommandMessage<RPCCommands.GetSelectedVoiceChannel> {
	data: RPCGetSelectedVoiceChannelResultData;
}

export interface RPCGetSkusResult extends RPCCommandMessage<RPCCommands.GetSkus> {
	data: RPCGetSkusResultData;
}

export interface RPCGetUserAchievementsResult extends RPCCommandMessage<RPCCommands.GetUserAchievements> {
	data: RPCGetUserAchievementsResultData;
}

export interface RPCGiftCodeBrowserResult extends RPCCommandMessage<RPCCommands.GiftCodeBrowser> {
	data: RPCGiftCodeBrowserResultData;
}

export interface RPCGuildTemplateBrowserResult extends RPCCommandMessage<RPCCommands.GuildTemplateBrowser> {
	data: RPCGuildTemplateBrowserResultData;
}

export interface RPCInviteBrowserResult extends RPCCommandMessage<RPCCommands.InviteBrowser> {
	data: RPCInviteBrowserResultData;
}

export interface RPCNetworkingCreateTokenResult extends RPCCommandMessage<RPCCommands.NetworkingCreateToken> {
	data: RPCNetworkingCreateTokenResultData;
}

export interface RPCNetworkingPeerMetricsResult extends RPCCommandMessage<RPCCommands.NetworkingPeerMetrics> {
	data: RPCNetworkingPeerMetricsResultData;
}

export interface RPCNetworkingSystemMetricsResult extends RPCCommandMessage<RPCCommands.NetworkingSystemMetrics> {
	data: RPCNetworkingSystemMetricsResultData;
}

export interface RPCOpenOverlayActivityInviteResult extends RPCCommandMessage<RPCCommands.OpenOverlayActivityInvite> {
	data: RPCOpenOverlayActivityInviteResultData;
}

export interface RPCOpenOverlayGuildInviteResult extends RPCCommandMessage<RPCCommands.OpenOverlayGuildInvite> {
	data: RPCOpenOverlayGuildInviteResultData;
}

export interface RPCOpenOverlayVoiceSettingsResult extends RPCCommandMessage<RPCCommands.OpenOverlayVoiceSettings> {
	data: RPCOpenOverlayVoiceSettingsResultData;
}

export interface RPCOverlayResult extends RPCCommandMessage<RPCCommands.Overlay> {
	data: RPCOverlayResultData;
}

export interface RPCSearchLobbiesResult extends RPCCommandMessage<RPCCommands.SearchLobbies> {
	data: RPCSearchLobbiesResultData;
}

export interface RPCSendActivityJoinInviteResult extends RPCCommandMessage<RPCCommands.SendActivityJoinInvite> {
	data: RPCSendActivityJoinInviteResultData;
}

export interface RPCSendToLobbyResult extends RPCCommandMessage<RPCCommands.SendToLobby> {
	data: RPCSendToLobbyResultData;
}

export interface RPCSetCertifiedDevicesResult extends RPCCommandMessage<RPCCommands.SetCertifiedDevices> {
	data: RPCSetCertifiedDevicesResultData;
}

export interface RPCSetOverlayLockedResult extends RPCCommandMessage<RPCCommands.SetOverlayLocked> {
	data: RPCSetOverlayLockedResultData;
}

export interface RPCSetUserAchievementResult extends RPCCommandMessage<RPCCommands.SetUserAchievement> {
	data: RPCSetUserAchievementResultData;
}

export interface RPCSetUserVoiceSettingsResult extends RPCCommandMessage<RPCCommands.SetUserVoiceSettings> {
	data: RPCSetUserVoiceSettingsResultData;
}

export interface RPCSetUserVoiceSettings2Result extends RPCCommandMessage<RPCCommands.SetUserVoiceSettings2> {
	data: RPCSetUserVoiceSettings2ResultData;
}

export interface RPCSetVoiceSettings2Result extends RPCCommandMessage<RPCCommands.SetVoiceSettings2> {
	data: RPCSetVoiceSettings2ResultData;
}

export interface RPCStartPurchaseResult extends RPCCommandMessage<RPCCommands.StartPurchase> {
	data: RPCStartPurchaseResultData;
}

export interface RPCUpdateLobbyResult extends RPCCommandMessage<RPCCommands.UpdateLobby> {
	data: RPCUpdateLobbyResultData;
}

export interface RPCUpdateLobbyMemberResult extends RPCCommandMessage<RPCCommands.UpdateLobbyMember> {
	data: RPCUpdateLobbyMemberResultData;
}

export interface RPCValidateApplicationResult extends RPCCommandMessage<RPCCommands.ValidateApplication> {
	data: RPCValidateApplicationResultData;
}

export type RPCCommandsResult =
	| RPCAcceptActivityInviteResult
	| RPCActivityInviteUserResult
	| RPCAuthenticateResult
	| RPCAuthorizeResult
	| RPCBraintreePopupBridgeCallbackResult
	| RPCBrowserResult
	| RPCCaptureShortcutResult
	| RPCCloseActivityRequestResult
	| RPCConnectionsCallbackResult
	| RPCConnectToLobbyResult
	| RPCConnectToLobbyVoiceResult
	| RPCCreateChannelInviteResult
	| RPCCreateLobbyResult
	| RPCDeepLinkResult
	| RPCDeleteLobbyResult
	| RPCDisconnectFromLobbyResult
	| RPCDisconnectFromLobbyVoiceResult
	| RPCGetApplicationTicketResult
	| RPCGetChannelResult
	| RPCGetChannelsResult
	| RPCGetEntitlementsResult
	| RPCGetEntitlementTicketResult
	| RPCGetGuildResult
	| RPCGetGuildsResult
	| RPCGetImageResult
	| RPCGetNetworkingConfigResult
	| RPCGetRelationshipsResult
	| RPCGetSelectedVoiceChannelResult
	| RPCGetSkusResult
	| RPCGetUserAchievementsResult
	| RPCGetUserResult
	| RPCGetVoiceSettingsResult
	| RPCGiftCodeBrowserResult
	| RPCGuildTemplateBrowserResult
	| RPCInviteBrowserResult
	| RPCNetworkingCreateTokenResult
	| RPCNetworkingPeerMetricsResult
	| RPCNetworkingSystemMetricsResult
	| RPCOpenOverlayActivityInviteResult
	| RPCOpenOverlayGuildInviteResult
	| RPCOpenOverlayVoiceSettingsResult
	| RPCOverlayResult
	| RPCSearchLobbiesResult
	| RPCSelectTextChannelResult
	| RPCSelectVoiceChannelResult
	| RPCSendActivityJoinInviteResult
	| RPCSendToLobbyResult
	| RPCSetActivityResult
	| RPCSetCertifiedDevicesResult
	| RPCSetOverlayLockedResult
	| RPCSetUserAchievementResult
	| RPCSetUserVoiceSettings2Result
	| RPCSetUserVoiceSettingsResult
	| RPCSetVoiceSettings2Result
	| RPCSetVoiceSettingsResult
	| RPCStartPurchaseResult
	| RPCSubscribeResult
	| RPCUnsubscribeResult
	| RPCUpdateLobbyMemberResult
	| RPCUpdateLobbyResult
	| RPCValidateApplicationResult;

export interface RPCActivityInviteDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCActivityInviteDispatchData;
	evt: RPCEvents.ActivityInvite;
}

export interface RPCActivityJoinDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCActivityJoinDispatchData;
	evt: RPCEvents.ActivityJoin;
}

export interface RPCActivityJoinRequestDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCActivityJoinRequestDispatchData;
	evt: RPCEvents.ActivityJoinRequest;
}

export interface RPCActivitySpectateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCActivitySpectateDispatchData;
	evt: RPCEvents.ActivitySpectate;
}

export interface RPCChannelCreateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCChannelCreateDispatchData;
	evt: RPCEvents.ChannelCreate;
}

export interface RPCCurrentUserUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCCurrentUserUpdateDispatchData;
	evt: RPCEvents.CurrentUserUpdate;
}

export interface RPCEntitlementCreateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCEntitlementCreateDispatchData;
	evt: RPCEvents.EntitlementCreate;
}

export interface RPCEntitlementDeleteDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCEntitlementDeleteDispatchData;
	evt: RPCEvents.EntitlementDelete;
}

export interface RPCErrorDispatch<
	Cmd extends Exclude<RPCCommands, RPCCommands.Dispatch> = Exclude<RPCCommands, RPCCommands.Dispatch>,
> extends RPCCommandMessage<Cmd> {
	data: RPCErrorDispatchData;
	evt: RPCEvents.Error;
}

export interface RPCGameJoinDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCGameJoinDispatchData;
	evt: RPCEvents.GameJoin;
}

export interface RPCGameSpectateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCGameSpectateDispatchData;
	evt: RPCEvents.GameSpectate;
}

export interface RPCGuildCreateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCGuildCreateDispatchData;
	evt: RPCEvents.GuildCreate;
}

export interface RPCGuildStatusDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCGuildStatusDispatchData;
	evt: RPCEvents.GuildStatus;
}

export interface RPCLobbyDeleteDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCLobbyDeleteDispatchData;
	evt: RPCEvents.LobbyDelete;
}

export interface RPCLobbyMemberConnectDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCLobbyMemberConnectDispatchData;
	evt: RPCEvents.LobbyMemberConnect;
}

export interface RPCLobbyMemberDisconnectDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCLobbyMemberDisconnectDispatchData;
	evt: RPCEvents.LobbyMemberDisconnect;
}

export interface RPCLobbyMemberUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCLobbyMemberUpdateDispatchData;
	evt: RPCEvents.LobbyMemberUpdate;
}

export interface RPCLobbyMessageDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCLobbyMessageDispatchData;
	evt: RPCEvents.LobbyMessage;
}

export interface RPCLobbyUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCLobbyUpdateDispatchData;
	evt: RPCEvents.LobbyUpdate;
}

export interface RPCMessageCreateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCMessageCreateDispatchData;
	evt: RPCEvents.MessageCreate;
}

export interface RPCMessageDeleteDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCMessageDeleteDispatchData;
	evt: RPCEvents.MessageDelete;
}

export interface RPCMessageUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCMessageUpdateDispatchData;
	evt: RPCEvents.MessageUpdate;
}

export interface RPCNotificationCreateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCNotificationCreateDispatchData;
	evt: RPCEvents.NotificationCreate;
}

export interface RPCOverlayDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCOverlayDispatchData;
	evt: RPCEvents.Overlay;
}

export interface RPCOverlayUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCOverlayUpdateDispatchData;
	evt: RPCEvents.OverlayUpdate;
}

export interface RPCReadyDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCReadyDispatchData;
	evt: RPCEvents.Ready;
}

export interface RPCRelationshipUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCRelationshipUpdateDispatchData;
	evt: RPCEvents.RelationshipUpdate;
}

export interface RPCSpeakingStartDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCSpeakingStartDispatchData;
	evt: RPCEvents.SpeakingStart;
}

export interface RPCSpeakingStopDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCSpeakingStopDispatchData;
	evt: RPCEvents.SpeakingStop;
}

export interface RPCUserAchievementUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCUserAchievementUpdateDispatchData;
	evt: RPCEvents.UserAchievementUpdate;
}

export interface RPCVoiceChannelSelectDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCVoiceChannelSelectDispatchData;
	evt: RPCEvents.VoiceChannelSelect;
}

export interface RPCVoiceConnectionStatusDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCVoiceConnectionStatusDispatchData;
	evt: RPCEvents.VoiceConnectionStatus;
}

export interface RPCVoiceSettingsUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCVoiceSettingsUpdateDispatchData;
	evt: RPCEvents.VoiceSettingsUpdate;
}

export interface RPCVoiceSettingsUpdate2Dispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCVoiceSettingsUpdate2DispatchData;
	evt: RPCEvents.VoiceSettingsUpdate2;
}

export interface RPCVoiceStateCreateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCVoiceStateCreateDispatchData;
	evt: RPCEvents.VoiceStateCreate;
}

export interface RPCVoiceStateDeleteDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCVoiceStateDeleteDispatchData;
	evt: RPCEvents.VoiceStateDelete;
}

export interface RPCVoiceStateUpdateDispatch extends BaseRPCMessage<RPCCommands.Dispatch> {
	data: RPCVoiceStateUpdateDispatchData;
	evt: RPCEvents.VoiceStateUpdate;
}

export type RPCEventsDispatch =
	| RPCActivityInviteDispatch
	| RPCActivityJoinDispatch
	| RPCActivityJoinRequestDispatch
	| RPCActivitySpectateDispatch
	| RPCChannelCreateDispatch
	| RPCCurrentUserUpdateDispatch
	| RPCEntitlementCreateDispatch
	| RPCEntitlementDeleteDispatch
	| RPCErrorDispatch
	| RPCGameJoinDispatch
	| RPCGameSpectateDispatch
	| RPCGuildCreateDispatch
	| RPCGuildStatusDispatch
	| RPCLobbyDeleteDispatch
	| RPCLobbyMemberConnectDispatch
	| RPCLobbyMemberDisconnectDispatch
	| RPCLobbyMemberUpdateDispatch
	| RPCLobbyMessageDispatch
	| RPCLobbyUpdateDispatch
	| RPCMessageCreateDispatch
	| RPCMessageDeleteDispatch
	| RPCMessageUpdateDispatch
	| RPCNotificationCreateDispatch
	| RPCOverlayDispatch
	| RPCOverlayUpdateDispatch
	| RPCReadyDispatch
	| RPCRelationshipUpdateDispatch
	| RPCSpeakingStartDispatch
	| RPCSpeakingStopDispatch
	| RPCUserAchievementUpdateDispatch
	| RPCVoiceChannelSelectDispatch
	| RPCVoiceConnectionStatusDispatch
	| RPCVoiceSettingsUpdate2Dispatch
	| RPCVoiceSettingsUpdateDispatch
	| RPCVoiceStateCreateDispatch
	| RPCVoiceStateDeleteDispatch
	| RPCVoiceStateUpdateDispatch;

export type RPCMessage = RPCCommandsResult | RPCEventsDispatch;

export type RPCMessagePayload =
	| RPCCommandAcceptActivityInvitePayload
	| RPCCommandActivityInviteUserPayload
	| RPCCommandAuthenticatePayload
	| RPCCommandAuthorizePayload
	| RPCCommandBraintreePopupBridgeCallbackPayload
	| RPCCommandBrowserPayload
	| RPCCommandCaptureShortcutPayload
	| RPCCommandCloseActivityJoinRequestPayload
	| RPCCommandConnectionsCallbackPayload
	| RPCCommandConnectToLobbyPayload
	| RPCCommandConnectToLobbyVoicePayload
	| RPCCommandCreateChannelInvitePayload
	| RPCCommandCreateLobbyPayload
	| RPCCommandDeepLinkPayload
	| RPCCommandDeleteLobbyPayload
	| RPCCommandDisconnectFromLobbyPayload
	| RPCCommandDisconnectFromLobbyVoicePayload
	| RPCCommandGetApplicationTicketPayload
	| RPCCommandGetChannelPayload
	| RPCCommandGetChannelsPayload
	| RPCCommandGetEntitlementsPayload
	| RPCCommandGetEntitlementTicketPayload
	| RPCCommandGetGuildPayload
	| RPCCommandGetGuildsPayload
	| RPCCommandGetImagePayload
	| RPCCommandGetNetworkingConfigPayload
	| RPCCommandGetRelationshipsPayload
	| RPCCommandGetSelectedVoiceChannelPayload
	| RPCCommandGetSkusPayload
	| RPCCommandGetUserAchievementsPayload
	| RPCCommandGetUserPayload
	| RPCCommandGetVoiceSettingsPayload
	| RPCCommandGiftCodeBrowserPayload
	| RPCCommandGuildTemplateBrowserPayload
	| RPCCommandInviteBrowserPayload
	| RPCCommandNetworkingCreateTokenPayload
	| RPCCommandNetworkingPeerMetricsPayload
	| RPCCommandNetworkingSystemMetricsPayload
	| RPCCommandOpenOverlayActivityInvitePayload
	| RPCCommandOpenOverlayGuildInvitePayload
	| RPCCommandOpenOverlayVoiceSettingsPayload
	| RPCCommandOverlayPayload
	| RPCCommandSearchLobbiesPayload
	| RPCCommandSelectTextChannelPayload
	| RPCCommandSelectVoiceChannelPayload
	| RPCCommandSendActivityJoinInvitePayload
	| RPCCommandSendToLobbyPayload
	| RPCCommandSetActivityPayload
	| RPCCommandSetCertifiedDevicesPayload
	| RPCCommandSetOverlayLockedPayload
	| RPCCommandSetUserAchievementPayload
	| RPCCommandSetUserVoiceSettings2Payload
	| RPCCommandSetUserVoiceSettingsPayload
	| RPCCommandSetVoiceSettings2Payload
	| RPCCommandSetVoiceSettingsPayload
	| RPCCommandStartPurchasePayload
	| RPCCommandSubscribePayload
	| RPCCommandUnsubscribePayload
	| RPCCommandUpdateLobbyMemberPayload
	| RPCCommandUpdateLobbyPayload
	| RPCCommandValidateApplicationPayload;

// TODO: get rid of all types above as they will be within discord-api-types soon

export enum Events {
	ApplicationReady = 'ready',
	Disconnected = 'disconnected',
}

export interface MappedRPCCommandsResultsData {
	[RPCCommands.Authorize]: RPCAuthorizeResultData;
	[RPCCommands.Authenticate]: RPCAuthenticateResultData;
	[RPCCommands.GetChannel]: RPCGetChannelResultData;
	[RPCCommands.GetChannels]: RPCGetChannelsResultData;
	[RPCCommands.GetGuild]: RPCGetGuildResultData;
	[RPCCommands.GetGuilds]: RPCGetGuildsResultData;
	[RPCCommands.GetUser]: RPCGetUserResultData;
	[RPCCommands.GetVoiceSettings]: RPCGetVoiceSettingsResultData;
	[RPCCommands.SelectTextChannel]: RPCSelectTextChannelResultData;
	[RPCCommands.SelectVoiceChannel]: RPCSelectVoiceChannelResultData;
	[RPCCommands.SetActivity]: RPCSetActivityResultData;
	[RPCCommands.SetVoiceSettings]: RPCSetVoiceSettingsResultData;
	[RPCCommands.Subscribe]: RPCSubscribeResultData;
	[RPCCommands.Unsubscribe]: RPCSubscribeResultData;
	[RPCCommands.AcceptActivityInvite]: RPCAcceptActivityInviteResultData;
	[RPCCommands.ActivityInviteUser]: RPCActivityInviteUserResultData;
	[RPCCommands.BraintreePopupBridgeCallback]: RPCBraintreePopupBridgeCallbackResultData;
	[RPCCommands.BrowserHandoff]: RPCBrowserHandoffResultData;
	[RPCCommands.CaptureShortcut]: RPCCaptureShortcutResultData;
	[RPCCommands.CloseActivityJoinRequest]: RPCCloseActivityRequestResultData;
	[RPCCommands.ConnectToLobby]: RPCConnectToLobbyResultData;
	[RPCCommands.ConnectToLobbyVoice]: RPCConnectToLobbyVoiceResultData;
	[RPCCommands.ConnectionsCallback]: RPCConnectionsCallbackResultData;
	[RPCCommands.CreateChannelInvite]: RPCCreateChannelInviteResultData;
	[RPCCommands.CreateLobby]: RPCCreateLobbyResultData;
	[RPCCommands.DeepLink]: RPCDeepLinkResultData;
	[RPCCommands.DeleteLobby]: RPCDeleteLobbyResultData;
	[RPCCommands.DisconnectFromLobby]: RPCDisconnectFromLobbyResultData;
	[RPCCommands.DisconnectFromLobbyVoice]: RPCDisconnectFromLobbyVoiceResultData;
	[RPCCommands.GetApplicationTicket]: RPCGetApplicationTicketResultData;
	[RPCCommands.GetEntitlementTicket]: RPCGetEntitlementTicketResultData;
	[RPCCommands.GetEntitlements]: RPCGetEntitlementsResultData;
	[RPCCommands.GetImage]: RPCGetImageResultData;
	[RPCCommands.GetNetworkingConfig]: RPCGetNetworkingConfigResultData;
	[RPCCommands.GetRelationships]: RPCGetRelationshipsResultData;
	[RPCCommands.GetSelectedVoiceChannel]: RPCGetSelectedVoiceChannelResultData;
	[RPCCommands.GetSkus]: RPCGetSkusResultData;
	[RPCCommands.GetUserAchievements]: RPCGetUserAchievementsResultData;
	[RPCCommands.GiftCodeBrowser]: RPCGiftCodeBrowserResultData;
	[RPCCommands.GuildTemplateBrowser]: RPCGuildTemplateBrowserResultData;
	[RPCCommands.InviteBrowser]: RPCInviteBrowserResultData;
	[RPCCommands.NetworkingCreateToken]: RPCNetworkingCreateTokenResultData;
	[RPCCommands.NetworkingPeerMetrics]: RPCNetworkingPeerMetricsResultData;
	[RPCCommands.NetworkingSystemMetrics]: RPCNetworkingSystemMetricsResultData;
	[RPCCommands.OpenOverlayActivityInvite]: RPCOpenOverlayActivityInviteResultData;
	[RPCCommands.OpenOverlayGuildInvite]: RPCOpenOverlayGuildInviteResultData;
	[RPCCommands.OpenOverlayVoiceSettings]: RPCOpenOverlayVoiceSettingsResultData;
	[RPCCommands.Overlay]: RPCOverlayResultData;
	[RPCCommands.SearchLobbies]: RPCSearchLobbiesResultData;
	[RPCCommands.SendActivityJoinInvite]: RPCSendActivityJoinInviteResultData;
	[RPCCommands.SendToLobby]: RPCSendToLobbyResultData;
	[RPCCommands.SetCertifiedDevices]: RPCSetCertifiedDevicesResultData;
	[RPCCommands.SetOverlayLocked]: RPCSetOverlayLockedResultData;
	[RPCCommands.SetUserAchievement]: RPCSetUserAchievementResultData;
	[RPCCommands.SetUserVoiceSettings]: RPCSetUserVoiceSettingsResultData;
	[RPCCommands.SetUserVoiceSettings2]: RPCSetUserVoiceSettings2ResultData;
	[RPCCommands.SetVoiceSettings2]: RPCSetVoiceSettings2ResultData;
	[RPCCommands.StartPurchase]: RPCStartPurchaseResultData;
	[RPCCommands.UpdateLobby]: RPCUpdateLobbyResultData;
	[RPCCommands.UpdateLobbyMember]: RPCUpdateLobbyMemberResultData;
	[RPCCommands.ValidateApplication]: RPCValidateApplicationResultData;
}

export interface MappedRPCCommandsArgs {
	[RPCCommands.Authorize]: RPCAuthorizeArgs;
	[RPCCommands.Authenticate]: RPCAuthenticateArgs;
	[RPCCommands.GetChannel]: RPCGetChannelArgs;
	[RPCCommands.GetChannels]: RPCGetChannelsArgs;
	[RPCCommands.GetGuild]: RPCGetGuildArgs;
	[RPCCommands.GetGuilds]: RPCGetGuildsArgs;
	[RPCCommands.GetUser]: RPCGetUserArgs;
	[RPCCommands.GetVoiceSettings]: RPCGetVoiceSettingsArgs;
	[RPCCommands.SelectTextChannel]: RPCSelectTextChannelArgs;
	[RPCCommands.SelectVoiceChannel]: RPCSelectVoiceChannelArgs;
	[RPCCommands.SetActivity]: RPCSetActivityArgs;
	[RPCCommands.SetVoiceSettings]: RPCSetVoiceSettingsArgs;
	[RPCCommands.Subscribe]: RPCCommandSubscribePayload['args'];
	[RPCCommands.Unsubscribe]: RPCCommandSubscribePayload['args'];
	[RPCCommands.AcceptActivityInvite]: RPCAcceptActivityInviteArgs;
	[RPCCommands.ActivityInviteUser]: RPCActivityInviteUserArgs;
	[RPCCommands.BraintreePopupBridgeCallback]: RPCBraintreePopupBridgeCallbackArgs;
	[RPCCommands.BrowserHandoff]: RPCBrowserHandoffArgs;
	[RPCCommands.CaptureShortcut]: RPCCaptureShortcutArgs;
	[RPCCommands.CloseActivityJoinRequest]: RPCCloseActivityRequestArgs;
	[RPCCommands.ConnectToLobby]: RPCConnectToLobbyArgs;
	[RPCCommands.ConnectToLobbyVoice]: RPCConnectToLobbyVoiceArgs;
	[RPCCommands.ConnectionsCallback]: RPCConnectionsCallbackArgs;
	[RPCCommands.CreateChannelInvite]: RPCCreateChannelInviteArgs;
	[RPCCommands.CreateLobby]: RPCCreateLobbyArgs;
	[RPCCommands.DeepLink]: RPCDeepLinkArgs;
	[RPCCommands.DeleteLobby]: RPCDeleteLobbyArgs;
	[RPCCommands.DisconnectFromLobby]: RPCDisconnectFromLobbyArgs;
	[RPCCommands.DisconnectFromLobbyVoice]: RPCDisconnectFromLobbyVoiceArgs;
	[RPCCommands.GetApplicationTicket]: RPCGetApplicationTicketArgs;
	[RPCCommands.GetEntitlementTicket]: RPCGetEntitlementTicketArgs;
	[RPCCommands.GetEntitlements]: RPCGetEntitlementsArgs;
	[RPCCommands.GetImage]: RPCGetImageArgs;
	[RPCCommands.GetNetworkingConfig]: RPCGetNetworkingConfigArgs;
	[RPCCommands.GetRelationships]: RPCGetRelationshipsArgs;
	[RPCCommands.GetSelectedVoiceChannel]: RPCGetSelectedVoiceChannelArgs;
	[RPCCommands.GetSkus]: RPCGetSkusArgs;
	[RPCCommands.GetUserAchievements]: RPCGetUserAchievementsArgs;
	[RPCCommands.GiftCodeBrowser]: RPCGiftCodeBrowserArgs;
	[RPCCommands.GuildTemplateBrowser]: RPCGuildTemplateBrowserArgs;
	[RPCCommands.InviteBrowser]: RPCInviteBrowserArgs;
	[RPCCommands.NetworkingCreateToken]: RPCNetworkingCreateTokenArgs;
	[RPCCommands.NetworkingPeerMetrics]: RPCNetworkingPeerMetricsArgs;
	[RPCCommands.NetworkingSystemMetrics]: RPCNetworkingSystemMetricsArgs;
	[RPCCommands.OpenOverlayActivityInvite]: RPCOpenOverlayActivityInviteArgs;
	[RPCCommands.OpenOverlayGuildInvite]: RPCOpenOverlayGuildInviteArgs;
	[RPCCommands.OpenOverlayVoiceSettings]: RPCOpenOverlayVoiceSettingsArgs;
	[RPCCommands.Overlay]: RPCOverlayArgs;
	[RPCCommands.SearchLobbies]: RPCSearchLobbiesArgs;
	[RPCCommands.SendActivityJoinInvite]: RPCSendActivityJoinInviteArgs;
	[RPCCommands.SendToLobby]: RPCSendToLobbyArgs;
	[RPCCommands.SetCertifiedDevices]: RPCSetCertifiedDevicesArgs;
	[RPCCommands.SetOverlayLocked]: RPCSetOverlayLockedArgs;
	[RPCCommands.SetUserAchievement]: RPCSetUserAchievementArgs;
	[RPCCommands.SetUserVoiceSettings]: RPCSetUserVoiceSettingsArgs;
	[RPCCommands.SetUserVoiceSettings2]: RPCSetUserVoiceSettings2Args;
	[RPCCommands.SetVoiceSettings2]: RPCSetVoiceSettings2Args;
	[RPCCommands.StartPurchase]: RPCStartPurchaseArgs;
	[RPCCommands.UpdateLobby]: RPCUpdateLobbyArgs;
	[RPCCommands.UpdateLobbyMember]: RPCUpdateLobbyMemberArgs;
	[RPCCommands.ValidateApplication]: RPCValidateApplicationArgs;
}

export type RPCCallableCommands = Exclude<RPCCommands, RPCCommands.Dispatch>;

export interface MappedRPCSubscribeEventsArgs {
	[RPCEvents.Ready]: Record<string, never>;
	[RPCEvents.Error]: Record<string, never>;
	[RPCEvents.ActivityInvite]: RPCSubscribeActivityInviteArgs;
	[RPCEvents.ActivityJoin]: RPCSubscribeActivityJoinArgs;
	[RPCEvents.ActivityJoinRequest]: RPCSubscribeActivityJoinRequestArgs;
	[RPCEvents.ActivitySpectate]: RPCSubscribeActivitySpectateArgs;
	[RPCEvents.ChannelCreate]: RPCSubscribeChannelCreateArgs;
	[RPCEvents.CurrentUserUpdate]: RPCSubscribeCurrentUserUpdateArgs;
	[RPCEvents.EntitlementCreate]: RPCSubscribeEntitlementCreateArgs;
	[RPCEvents.EntitlementDelete]: RPCSubscribeEntitlementDeleteArgs;
	[RPCEvents.GameJoin]: RPCSubscribeGameJoinArgs;
	[RPCEvents.GameSpectate]: RPCSubscribeGameSpectateArgs;
	[RPCEvents.GuildCreate]: RPCSubscribeGuildCreateArgs;
	[RPCEvents.GuildStatus]: RPCSubscribeGuildStatusArgs;
	[RPCEvents.LobbyDelete]: RPCSubscribeLobbyDeleteArgs;
	[RPCEvents.LobbyMemberConnect]: RPCSubscribeLobbyMemberConnectArgs;
	[RPCEvents.LobbyMemberDisconnect]: RPCSubscribeLobbyMemberDisconnectArgs;
	[RPCEvents.LobbyMemberUpdate]: RPCSubscribeLobbyMemberUpdateArgs;
	[RPCEvents.LobbyMessage]: RPCSubscribeLobbyMessageArgs;
	[RPCEvents.LobbyUpdate]: RPCSubscribeLobbyUpdateArgs;
	[RPCEvents.MessageCreate]: RPCSubscribeMessageCreateArgs;
	[RPCEvents.MessageDelete]: RPCSubscribeMessageDeleteArgs;
	[RPCEvents.MessageUpdate]: RPCSubscribeMessageUpdateArgs;
	[RPCEvents.NotificationCreate]: RPCSubscribeNotificationCreateArgs;
	[RPCEvents.Overlay]: RPCSubscribeOverlayArgs;
	[RPCEvents.OverlayUpdate]: RPCSubscribeOverlayUpdateArgs;
	[RPCEvents.RelationshipUpdate]: RPCSubscribeRelationshipUpdateArgs;
	[RPCEvents.SpeakingStart]: RPCSubscribeSpeakingStartArgs;
	[RPCEvents.SpeakingStop]: RPCSubscribeSpeakingStopArgs;
	[RPCEvents.UserAchievementUpdate]: RPCSubscribeUserAchievementUpdateArgs;
	[RPCEvents.VoiceChannelSelect]: RPCSubscribeVoiceChannelSelectArgs;
	[RPCEvents.VoiceConnectionStatus]: RPCSubscribeVoiceConnectionStatusArgs;
	[RPCEvents.VoiceSettingsUpdate]: RPCSubscribeVoiceSettingsUpdateArgs;
	[RPCEvents.VoiceSettingsUpdate2]: RPCSubscribeVoiceSettingsUpdate2Args;
	[RPCEvents.VoiceStateCreate]: RPCSubscribeVoiceStateCreateArgs;
	[RPCEvents.VoiceStateDelete]: RPCSubscribeVoiceStateDeleteArgs;
	[RPCEvents.VoiceStateUpdate]: RPCSubscribeVoiceStateUpdateArgs;
}

export interface MappedRPCEventsDispatchData {
	[RPCEvents.ActivityInvite]: [RPCActivityInviteDispatchData];
	[RPCEvents.ActivityJoin]: [RPCActivityJoinDispatchData];
	[RPCEvents.ActivityJoinRequest]: [RPCActivityJoinRequestDispatchData];
	[RPCEvents.ActivitySpectate]: [RPCActivitySpectateDispatchData];
	[RPCEvents.ChannelCreate]: [RPCChannelCreateDispatchData];
	[RPCEvents.CurrentUserUpdate]: [RPCCurrentUserUpdateDispatchData];
	[RPCEvents.EntitlementCreate]: [RPCEntitlementCreateDispatchData];
	[RPCEvents.EntitlementDelete]: [RPCEntitlementDeleteDispatchData];
	[RPCEvents.Error]: [RPCErrorDispatchData];
	[RPCEvents.GameJoin]: [RPCGameJoinDispatchData];
	[RPCEvents.GameSpectate]: [RPCGameSpectateDispatchData];
	[RPCEvents.GuildCreate]: [RPCGuildCreateDispatchData];
	[RPCEvents.GuildStatus]: [RPCGuildStatusDispatchData];
	[RPCEvents.LobbyDelete]: [RPCLobbyDeleteDispatchData];
	[RPCEvents.LobbyMemberConnect]: [RPCLobbyMemberConnectDispatchData];
	[RPCEvents.LobbyMemberDisconnect]: [RPCLobbyMemberDisconnectDispatchData];
	[RPCEvents.LobbyMemberUpdate]: [RPCLobbyMemberUpdateDispatchData];
	[RPCEvents.LobbyMessage]: [RPCLobbyMessageDispatchData];
	[RPCEvents.LobbyUpdate]: [RPCLobbyUpdateDispatchData];
	[RPCEvents.MessageCreate]: [RPCMessageCreateDispatchData];
	[RPCEvents.MessageDelete]: [RPCMessageDeleteDispatchData];
	[RPCEvents.MessageUpdate]: [RPCMessageUpdateDispatchData];
	[RPCEvents.NotificationCreate]: [RPCNotificationCreateDispatchData];
	[RPCEvents.Overlay]: [RPCOverlayDispatchData];
	[RPCEvents.OverlayUpdate]: [RPCOverlayUpdateDispatchData];
	[RPCEvents.Ready]: [RPCReadyDispatchData];
	[RPCEvents.RelationshipUpdate]: [RPCRelationshipUpdateDispatchData];
	[RPCEvents.SpeakingStart]: [RPCSpeakingStartDispatchData];
	[RPCEvents.SpeakingStop]: [RPCSpeakingStopDispatchData];
	[RPCEvents.UserAchievementUpdate]: [RPCUserAchievementUpdateDispatchData];
	[RPCEvents.VoiceChannelSelect]: [RPCVoiceChannelSelectDispatchData];
	[RPCEvents.VoiceConnectionStatus]: [RPCVoiceConnectionStatusDispatchData];
	[RPCEvents.VoiceSettingsUpdate]: [RPCVoiceSettingsUpdateDispatchData];
	[RPCEvents.VoiceSettingsUpdate2]: [RPCVoiceSettingsUpdate2DispatchData];
	[RPCEvents.VoiceStateCreate]: [RPCVoiceStateCreateDispatchData];
	[RPCEvents.VoiceStateDelete]: [RPCVoiceStateDeleteDispatchData];
	[RPCEvents.VoiceStateUpdate]: [RPCVoiceStateUpdateDispatchData];
}

export type EventAndArgsParameters<Evt extends RPCEvents> =
	MappedRPCSubscribeEventsArgs[Evt] extends Record<string, never> ? [Evt] : [Evt, MappedRPCSubscribeEventsArgs[Evt]];

export type Nullable<T> = T | null | undefined;

export type NullableFields<T> = {
	[P in keyof T]: Nullable<T[P]>;
};
