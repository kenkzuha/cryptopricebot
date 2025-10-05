const { Client , GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = "1362436466877399160";

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

let lastBtcLevel = null;
let lastAsterLevel = null;


function fetchWithRetry(url, retries = 3) {
    return new Promise((res, rej) => {
        doFetch(url, retries, res, rej);
    })
}

async function doFetch(url, retries, res, rej) {
    try {
        const resp = await axios.get(url, { timeout: 10000 });
        return res(resp.data);
    } catch (err) {
        if (retries > 0) {
            setTimeout(() => {
                doFetch(url, retries - 1, res, rej);
            })
        } else {
            return rej(err);
        }
    }
}

async function checkPrices() {
    try {

        const btcData = await fetchWithRetry("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const btcPrice = parseFloat(btcData.price);
        const stepBtc = 1000;

        if (lastBtcLevel === null) {
            lastBtcLevel = Math.round(btcPrice / stepBtc) * stepBtc;

            const embed = new EmbedBuilder()
                .setTitle("$BTC Price Alert")
                .setDescription(`$BTC Price Crosses: **$${lastBtcLevel.toLocaleString()}**`)
                .setColor(0xffff00)
                .setTimestamp();
            const channel = await client.channels.fetch(CHANNEL_ID);
            channel.send({ embeds: [embed] });
        } else {
            if (btcPrice >= lastBtcLevel + stepBtc) {
                lastBtcLevel += stepBtc;
                console.log(lastBtcLevel);
                const embed = new EmbedBuilder()
                    .setTitle("$BTC Price Alert")
                    .setDescription(`$BTC Price Crosses Up to **$${lastBtcLevel.toLocaleString()}**`)
                    .setColor(0x00ff00)
                    .setTimestamp();
                const channel = await client.channels.fetch(CHANNEL_ID);
                channel.send({ embeds: [embed] });
            } else if (btcPrice <= lastBtcLevel - stepBtc) {
                lastBtcLevel -= stepBtc;
                console.log(lastBtcLevel);
                const embed = new EmbedBuilder()
                    .setTitle("$BTC Price Alert")
                    .setDescription(`$BTC Price Crosses Down to **$${lastBtcLevel.toLocaleString()}**`)
                    .setColor(0xff0000)
                    .setTimestamp();
                const channel = await client.channels.fetch(CHANNEL_ID);
                channel.send({ embeds: [embed] });
            }
        }

        const asterData = await fetchWithRetry("https://fapi.binance.com/fapi/v1/ticker/price?symbol=ASTERUSDT");
        const asterPrice = parseFloat(asterData.price);
        const stepAster = 0.05;

        if (lastAsterLevel === null) {
            lastAsterLevel = Math.round(asterPrice / stepAster) * stepAster;
            const embed = new EmbedBuilder()
                .setTitle("$ASTER Price Alert")
                .setDescription(`$ASTER Price Crosses: **$${lastAsterLevel.toLocaleString('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}**`)
                .setColor(0xffff00)
                .setTimestamp();
            const channel = await client.channels.fetch(CHANNEL_ID);
            channel.send({ embeds: [embed] });
        } else {
            if (asterPrice >= lastAsterLevel + stepAster) {
                lastAsterLevel += stepAster;
                console.log(lastAsterLevel);
                const embed = new EmbedBuilder()
                    .setTitle("$ASTER Price Alert")
                    .setDescription(`$ASTER Price Crosses Up to **$${lastAsterLevel.toLocaleString('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}**`)
                    .setColor(0x00ff00)
                    .setTimestamp();
                const channel = await client.channels.fetch(CHANNEL_ID);
                channel.send({ embeds: [embed] });
            } else if (asterPrice <= lastAsterLevel - stepAster) {
                lastAsterLevel -= stepAster;
                console.log(lastAsterLevel);
                const embed = new EmbedBuilder()
                    .setTitle("$ASTER Price Alert")
                    .setDescription(`$ASTER Price Crosses Down to **$${lastAsterLevel.toLocaleString('de-DE', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}**`)
                    .setColor(0xff0000)
                    .setTimestamp();
                const channel = await client.channels.fetch(CHANNEL_ID);
                channel.send({ embeds: [embed] });
            }
        }

    } catch (err) {
        console.error("Error fetching prices:", err);
    }
}

client.once("clientReady", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setInterval(checkPrices, 10000);
});

client.login(TOKEN);
