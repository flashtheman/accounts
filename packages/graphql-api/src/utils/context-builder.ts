import { AccountsRequest, AccountsModuleConfig } from '../modules';
import { ModuleConfig, ModuleSessionInfo } from '@graphql-modules/core';
import { getClientIp } from 'request-ip';

export const context = (moduleName: string) => async (
  { req }: AccountsRequest,
  _: any,
  { injector }: ModuleSessionInfo
) => {
  if (!req) {
    return {
      ip: '',
      userAgent: '',
    };
  }

  const config: AccountsModuleConfig = injector.get(ModuleConfig(moduleName));
  const headerName = config.headerName || 'Authorization';
  let authToken = (req.headers[headerName] || req.headers[headerName.toLowerCase()]) as string;
  authToken = authToken && authToken.replace('Bearer ', '');
  let user;

  if (authToken && !config.excludeAddUserInContext) {
    try {
      user = await config.accountsServer.resumeSession(authToken);
    } catch (error) {
      // Empty catch
    }
  }

  let userAgent: string = (req.headers['user-agent'] as string) || '';
  if (req.headers['x-ucbrowser-ua']) {
    // special case of UC Browser
    userAgent = req.headers['x-ucbrowser-ua'] as string;
  }

  return {
    authToken,
    userAgent,
    ip: getClientIp(req),
    user,
    userId: user && user.id,
  };
};
