export * from './client';
export * from './constants';
export * from './ipc';
export * from './util';

/**
 * The {@link https://github.com/discordjs/discord.js/blob/main/packages/rpc#readme | @discordjs/rpc} version
 * that you are currently using.
 */
// This needs to explicitly be `string` so it is not typed as a "const string" that gets injected by esbuild
export const version = '[VI]{{inject}}[/VI]' as string;
