const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const DATA_FILE = path.join(__dirname, 'users.json');

const readUsers = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]'); // Fallback to an empty array if file is empty
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
};

const writeUsers = (users) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error writing users:', error);
    }
};

const parseBody = (req) =>
    new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject(err);
            }
        });
    });

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        return res.end();
    }

    if (req.method === 'POST' && req.url === '/users') {
        try {
            const { name, email } = await parseBody(req);

            if (!name || !email) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'All fields are required.' }));
            }

            const users = readUsers();

            const duplicate = users.find((user) => user.email === email);
            if (duplicate) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Email already exists.' }));
            }

            const newUser = { name, email };
            users.push(newUser);
            writeUsers(users);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'User added successfully.' }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Error processing request.' }));
        }
    }

    if (req.method === 'GET' && req.url === '/users') {
        try {
            const users = readUsers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(users));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ message: 'Error retrieving users.' }));
        }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Route not found.' }));
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});