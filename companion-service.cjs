'use strict';
// Legacy IPC stays compatible, but ORIX never pairs with the original account service.
const error = 'ORIX does not use a TwoCode account. Connect your AI in Settings → Connections.';
const getConnection = () => ({ connected: false, user: null });
const connectToORIX = async () => ({ ok: false, ...getConnection(), error });
module.exports = { getConnection, connectToORIX, getORIXState: connectToORIX };
