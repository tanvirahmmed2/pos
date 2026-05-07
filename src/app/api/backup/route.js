import { pool } from "@/lib/database/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        let sql = `-- Nizam Store Full Backup\n`;
        sql += `-- Host: ${process.env.PG_HOST || 'Supabase'}\n`;
        sql += `-- Generation Time: ${new Date().toLocaleString()}\n`;
        sql += `SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT;\n`;
        sql += `SET NAMES utf8mb4;\n\n`;

        // 1. Get all tables
        const tablesRes = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
        const tables = tablesRes.rows.map(r => r.table_name);

        for (const table of tables) {
            sql += `\n--\n-- Table structure for table \`${table}\`\n--\n\n`;
            sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
            sql += `/*!40101 SET @saved_cs_client     = @@character_set_client */;\n`;
            sql += `/*!40101 SET character_set_client = utf8mb4 */;\n`;
            
            // 2. Fetch columns for CREATE TABLE
            const colsRes = await pool.query(`
                SELECT column_name, data_type, is_nullable, column_default, character_maximum_length
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);

            sql += `CREATE TABLE \`${table}\` (\n`;
            const colLines = colsRes.rows.map(col => {
                let line = `  \`${col.column_name}\` ${col.data_type}`;
                if (col.character_maximum_length) line += `(${col.character_maximum_length})`;
                if (col.is_nullable === 'NO') line += ` NOT NULL`;
                if (col.column_default) {
                    if (col.column_default.includes('nextval')) {
                        line += ` AUTO_INCREMENT`;
                    } else {
                        line += ` DEFAULT ${col.column_default}`;
                    }
                }
                return line;
            });

            // 3. Add Primary Key (Simplified detection)
            // Note: In real production, you'd query information_schema.table_constraints
            sql += colLines.join(',\n') + `\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n`;
            sql += `/*!40101 SET character_set_client = @saved_cs_client */;\n\n`;

            // 4. Fetch Data for INSERT
            const dataRes = await pool.query(`SELECT * FROM "${table}"`);
            if (dataRes.rows.length > 0) {
                sql += `LOCK TABLES \`${table}\` WRITE;\n`;
                sql += `/*!40000 ALTER TABLE \`${table}\` DISABLE KEYS */;\n`;
                
                // Format values: (val1, val2), (val3, val4)
                const valueRows = dataRes.rows.map(row => {
                    const vals = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'number') return val;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        // Escape single quotes for strings
                        return `'${String(val).replace(/'/g, "''")}'`;
                    }).join(',');
                    return `(${vals})`;
                });

                sql += `INSERT INTO \`${table}\` VALUES ${valueRows.join(',')};\n`;
                sql += `/*!40000 ALTER TABLE \`${table}\` ENABLE KEYS */;\n`;
                sql += `UNLOCK TABLES;\n`;
            }
        }

        return new NextResponse(sql, {
            headers: {
                'Content-Type': 'application/sql',
                'Content-Disposition': `attachment; filename="backup_${new Date().getTime()}.sql"`,
            },
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}