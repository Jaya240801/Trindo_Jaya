import express from 'express';
import getConnection from '../../../db.js';
import { isAdmin, verifyUser } from '../../middleware/authUser.js';

const router = express.Router();

router.get('/rankWrench', verifyUser, isAdmin, async (req, res) => {
    const conn = await getConnection();
    try {
        const data = await conn.execute(`
        SELECT * FROM rank_wrench ORDER BY alternatif_id`);
        res.status(200).json(data[0]);
    } catch (error) {
        res.status(400).json({
            statusCode: 400,
            message: "There is an error : " + error
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

router.post('/rankWrench', verifyUser, isAdmin, async (req, res) => {
    const conn = await getConnection()

    try {
        const { productId, productCategory, netFlow } = req.body;        
        if(!productId || !productCategory || !netFlow) return res.status(204).json({msg: 'field kosong'});
        
        const data = await conn.execute(`INSERT INTO rank_wrench VALUES(DEFAULT,?,?,?)`, [productId, productCategory, netFlow]);
        let statusCode = 200;
        let message = 'success';
        if (data[0] == 0) {
            statusCode = 400;
            message = 'gagal memasukan data resupply';
        }
        res.status(statusCode).json({
            statusCode,
            message,
        });
    } catch (e) {
        res.status(400).json({
            statusCode: 400,
            message: 'Error: ' + e,
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
});

router.delete('/rankWrench', verifyUser, isAdmin, async (req, res) => {
    const conn = await getConnection()
    try {
        const data = await conn.execute(`DELETE FROM rank_wrench`)
        var statusCode = 200, message = 'success';
        if (data[0].affectedRows > 0) {
            const tableName = 'rank_wrench';
            // const columnName = 'alternatif_id';
            // const maxIdQuery = `SELECT COALESCE(MAX(${columnName}), 0) + 1 AS max_id FROM ${tableName}`;
            // const [maxIdData] = await conn.execute(maxIdQuery);
            // const maxId = maxIdData[0].max_id;

            const resetQuery = `ALTER TABLE ${tableName} AUTO_INCREMENT = 1`;
            await conn.execute(resetQuery);
        } else {
            statusCode = 400;
            message = 'failed';
        }
        res.status(statusCode).json({
            statusCode,
            message
        })
    } catch (e) {
        res.status(400).json({
            statusCode: 400,
            message: 'Have an error ' + e
        });
    } finally {
        if (conn) {
            conn.release();
        }
    }
})

export default router;

