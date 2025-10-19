// Vercel Serverless Function - Entry Point
// Este archivo exporta la app de Express para Vercel

const app = require('../src/app');

// Vercel automaticamente maneja las requests y las pasa a esta función
module.exports = app;
