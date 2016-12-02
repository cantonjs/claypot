
import weixinJSSDK from 'koa-weixin-jssdk';
import Ask from 'http-ask';
import { getCache, setCache } from '../db/redis';

const WX_TICKET_CACHE_KEY = 'wx_js_ticket';

export default ({ appId, appSecret, ticketURL, fetchToken }) => {
	const config = {
		appId,
		secret: appSecret,
		pathName: '/',
	};

	if (fetchToken) {
		config.fetchTicket = async () => {
			const ticketResp = await getCache(WX_TICKET_CACHE_KEY);
			if (ticketResp) {
				return ticketResp;
			}
			const json = await Ask.request(
				`${ticketURL}?access_token=${fetchToken}`
			);
			await setCache(WX_TICKET_CACHE_KEY, json, json.expires_in / 1000);
			return json;
		};
	}

	return weixinJSSDK(config);
};
