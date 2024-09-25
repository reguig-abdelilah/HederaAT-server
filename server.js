
const { TokenCreateTransaction, TokenType, TokenMintTransaction, TokenSupplyType, PrivateKey, Client, AccountId, Hbar, TokenId, TransferTransaction } = require("@hashgraph/sdk");
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv')
const express = require('express')
const path = require('path');
const TokenSchema = require('./schemas/tokenschema.js');
const { send } = require("process");
const app = express();
const port = 3000
dotenv.config()
app.use(cors({
    origin: 'http://45.79.221.196/'
}));
// mongoose.connect('mongodb+srv://reguigabdelilah:U6ftepaifnG46adU@cluster0.jo41l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
try {
    mongoose.connect('mongodb://127.0.0.1:27017/hashgraph');
} catch (error) {
    console.log(error)    
}
// app.get('/contribute',(req,res)=>{
//     console.log('Server Called')
//     res.json({success:false})
// })

// Serve static files from the React app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/tokendata', async(req,res)=>{
    const data = req.query;
    console.log(data?.tokenname)
    console.log(!data?.tokenname)

    try {
        if(!data?.tokenname){
            console.log('please provide tokenname')
            res.status(500).json('please provide tokenname')
        }else{
            let token = await TokenSchema.VerifyTokenExist(data.tokenname)
            res.json(token.raisedfunds)
        }
    } catch (error) {
        res.status(500).json(error)
        console.log(error.message)
    }
    
})
app.post('/token/campaign1',async (req,res)=>{
    const data = req.body;
    if(!data?.address || !data?.contribution){
        console.log('Email or Contribution not provided')
        res.sendStatus(500)
        return
    }
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID)
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_PVKEY)
    const client = Client.forTestnet().setOperator(operatorId, operatorKey)

    let token = await TokenSchema.VerifyTokenExist('TeckInov')
    if(token === null)
    {
        console.log('creating the token')

        console.log('Creating Token ------')
        token = new TokenSchema({
            symbol: 'TeckInov',
        })
        


        if(operatorId === null || operatorKey === null){
            throw new Error('OperatorId and OperatorKey are not present in the emvironment')
        }

        


        const supplyKey = PrivateKey.generateED25519()
        token.supplyKey = supplyKey
        console.log('supplyKey ', supplyKey.toString())
        try {
            const tokenCreateTx = await new TokenCreateTransaction()
            .setTokenName("TeckInov")
            .setTokenSymbol("TNI")
            .setTokenType(TokenType.FungibleCommon)
            .setDecimals(0)
            .setInitialSupply(2)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(10000)
            .setTreasuryAccountId(operatorId)
            .setSupplyKey(supplyKey)
            .freezeWith(client);

            const tokenCreateTxSigned = await tokenCreateTx.sign(operatorKey)

            const tokenCreateTxResponse = await tokenCreateTxSigned.execute(client)
            
            const tokenCreateTxReceipt = await tokenCreateTxResponse.getReceipt(client);

            if(tokenCreateTxReceipt.status.toString() === 'SUCCESS'){
                console.log("Token created with ID:", tokenCreateTxReceipt.tokenId.toString());  
                token.tokenid = tokenCreateTxReceipt.tokenId.toString()
                token.raisedfunds += 2
                await token.save()
                res.json(token.raisedfunds)
                // console.log(token)
                // res.json(tokenCreateTxReceipt)
            }else{
                console.log("error creating token");
                res.sendStatus(500)  
            }

        } catch (error) {
            console.log(error)
        }
    }else{
        console.log('minting the token')
        const amountToMint = data?.contribution | 0
        console.log('amountToMint', amountToMint)
        const tokenId= TokenId.fromString(token.tokenid)

        const tokenMintTx = await new TokenMintTransaction()
        // .setMetadata([new TextEncoder().encode("TeckInov")])
        .setMaxTransactionFee(new Hbar(20))
        .setTokenId( tokenId )
        .setAmount(amountToMint)
        .freezeWith(client);
        
        const supplyKey = PrivateKey.fromString(token.supplyKey)
        const  tokenMintTxSigned = await tokenMintTx.sign(supplyKey)

        const tokenMintTxResponse = await tokenMintTxSigned.execute(client);

        const tokenMintTxReceipt = await tokenMintTxResponse.getReceipt(client);
        if(tokenMintTxReceipt.status.toString() === 'SUCCESS'){
            
            let trans = await new TransferTransaction()
            .addTokenTransfer(token.tokenid, process.env.OPERATOR_ID, -amountToMint)
            .addTokenTransfer(token.tokenid, data?.address, amountToMint)
            .freezeWith(client);
            
            let response = await trans.execute(client);
            token.raisedfunds += amountToMint
            await token.save()
            res.json(token.raisedfunds)

            // res.sendStatus(200)
        }
        else
            res.sendStatus(500)
    }
    client.close();

    
})
app.post('/token/campaign2',async (req,res)=>{
    const data = req.body;
    if(!data?.address || !data?.contribution){
        console.log('Email or Contribution not provided')
        res.sendStatus(500)
        return
    }
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID)
    const operatorKey = PrivateKey.fromStringED25519(process.env.OPERATOR_PVKEY)
    const client = Client.forTestnet().setOperator(operatorId, operatorKey)

    let token = await TokenSchema.VerifyTokenExist('EchoFr')
    if(token === null)
    {
        console.log('creating the token')

        console.log('Creating Token ------')
        token = new TokenSchema({
            symbol: 'EchoFr',
        })
        


        if(operatorId === null || operatorKey === null){
            throw new Error('OperatorId and OperatorKey are not present in the emvironment')
        }

        


        const supplyKey = PrivateKey.generateED25519()
        token.supplyKey = supplyKey
        console.log('supplyKey ', supplyKey.toString())
        try {
            const tokenCreateTx = await new TokenCreateTransaction()
            .setTokenName("EchoFr")
            .setTokenSymbol("EFR")
            .setTokenType(TokenType.FungibleCommon)
            .setDecimals(0)
            .setInitialSupply(2)
            .setSupplyType(TokenSupplyType.Finite)
            .setMaxSupply(15000)
            .setTreasuryAccountId(operatorId)
            .setSupplyKey(supplyKey)
            .freezeWith(client);

            const tokenCreateTxSigned = await tokenCreateTx.sign(operatorKey)

            const tokenCreateTxResponse = await tokenCreateTxSigned.execute(client)
            
            const tokenCreateTxReceipt = await tokenCreateTxResponse.getReceipt(client);

            if(tokenCreateTxReceipt.status.toString() === 'SUCCESS'){
                console.log("Token created with ID:", tokenCreateTxReceipt.tokenId.toString());  
                token.tokenid = tokenCreateTxReceipt.tokenId.toString()
                token.raisedfunds += 2
                await token.save()
                res.json(token.raisedfunds)

                // console.log(token)
                // res.json(tokenCreateTxReceipt)
            }else{
                console.log("error creating token");
                res.sendStatus(500)  
            }

        } catch (error) {
            console.log(error)
        }
    }else{
        console.log('minting the token')
        const amountToMint = data?.contribution | 0
        console.log('amountToMint', amountToMint)
        const tokenId= TokenId.fromString(token.tokenid)

        const tokenMintTx = await new TokenMintTransaction()
        // .setMetadata([new TextEncoder().encode("TeckInov")])
        .setMaxTransactionFee(new Hbar(20))
        .setTokenId( tokenId )
        .setAmount(amountToMint)
        .freezeWith(client);
        const supplyKey = PrivateKey.fromString(token.supplyKey)
        const  tokenMintTxSigned = await tokenMintTx.sign(supplyKey)
        
        const tokenMintTxResponse = await tokenMintTxSigned.execute(client);
        
        const tokenMintTxReceipt = await tokenMintTxResponse.getReceipt(client);
        if(tokenMintTxReceipt.status.toString() === 'SUCCESS'){
            
            let trans = await new TransferTransaction()
            .addTokenTransfer(token.tokenid, process.env.OPERATOR_ID, -amountToMint)
            .addTokenTransfer(token.tokenid, data?.address, amountToMint)
            .freezeWith(client);
            
            let response = await trans.execute(client);
            token.raisedfunds += amountToMint
            console.log(' ')
            await token.save()
            res.json(token.raisedfunds)
            // res.sendStatus(200)
        }
        else
            res.sendStatus(500)
    }
    client.close();

    
})

app.use(express.static(path.join(__dirname, 'public')));
// Serve the index.html file for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// app.listen(port, ()=>{console.log(`Server listening on port ${port}`)})
app.listen(port,'0.0.0.0', ()=>{console.log(`Server listening on port ${port}`)})