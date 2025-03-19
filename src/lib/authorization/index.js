const jwksClient = require('jwks-rsa');
const jwt = require('jsonwebtoken');

const client = jwksClient({
    jwksUri: process.env.AUTH0_JWKS_URI,
    timeout: 30000,
});

const verifyJWT = async (token) => {
    const completePayload = jwt.decode(token, { complete: true });
    const { kid } = completePayload.header;
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    const payload = jwt.verify(token, signingKey);
    return payload;
};

module.exports = {
    verifyJWT,
};
