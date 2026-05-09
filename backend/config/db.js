const dns = require('dns');
const mongoose = require('mongoose');

// Set public DNS servers to bypass Docker/VPN/firewall DNS blocks
if (process.env.MONGO_DNS_SERVERS) {
    dns.setServers(process.env.MONGO_DNS_SERVERS.split(',').map(s => s.trim()));
} else {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        throw err;
    }
};

module.exports = connectDB;