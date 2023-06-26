"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const amqp = __importStar(require("amqplib"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// RabbitMQ configuration
const rabbitMQUrl = process.env.RABBIT_MQ;
const queueName = 'RabbitMQ_Queue';
// Connect to RabbitMQ and consume messages
function consumeMessages() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield amqp.connect(rabbitMQUrl);
            const channel = yield connection.createChannel();
            yield channel.assertQueue(queueName, { durable: true });
            channel.consume(queueName, (msg) => {
                if (msg !== null) {
                    const message = msg.content.toString();
                    console.log('Received message:', message);
                    channel.ack(msg);
                }
            }, { noAck: false });
            connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
            });
            process.on('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
                yield channel.close();
                yield connection.close();
                process.exit(0);
            }));
        }
        catch (error) {
            console.error('Error while setting up RabbitMQ connection:', error);
        }
    });
}
// Express route to handle incoming requests
app.get('/', (req, res) => {
    res.send('Server is running');
});
// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    consumeMessages();
});
