const session = require("../session/session");

function getAuthHeaders() {
    return { Authorization: `Bearer ${session.accessToken}` };
}

module.exports = { getAuthHeaders }