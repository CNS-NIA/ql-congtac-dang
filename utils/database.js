const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ql_cong_tac_dang',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    async execute(sql, params = []) {
        const connection = await this.pool.getConnection();
        try {
            const [rows] = await connection.execute(sql, params);
            return rows;
        } finally {
            connection.release();
        }
    }

    async query(sql, params = []) {
        return this.execute(sql, params);
    }

    async testConnection() {
        try {
            await this.execute('SELECT 1');
            console.log('✅ Kết nối database thành công');
            return true;
        } catch (error) {
            console.error('❌ Lỗi kết nối database:', error.message);
            return false;
        }
    }
}

module.exports = new Database();
