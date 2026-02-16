const { spawn } = require('child_process');
const { execSync } = require('child_process');
require('dotenv').config(); // Load .env file

async function startWithNgrok() {
  try {
    // Check if auth token exists
    if (!process.env.NGROK_AUTH_TOKEN) {
      console.error('❌ NGROK_AUTH_TOKEN not found in .env file!');
      console.error('💡 Add your token to .env: NGROK_AUTH_TOKEN=your_token_here');
      process.exit(1);
    }

    // Kill any existing processes
    console.log('🧹 Cleaning up existing processes...');
    try {
      execSync('taskkill /F /IM ngrok.exe 2>nul', { stdio: 'ignore' });
    } catch (e) {
      // Ignore if nothing to kill
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('🚀 Starting server...');

    // Start the server
    const server = spawn('nodemon', ['--exec', 'ts-node', 'src/server.ts'], {
      shell: true,
      stdio: 'inherit'
    });

    // Wait for server to start
    console.log('⏳ Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🌐 Starting ngrok tunnel...\n');

    // Start ngrok with auth token
    const ngrok = spawn('ngrok', [
      'http',
      '3000',
      '--authtoken',
      process.env.NGROK_AUTH_TOKEN,
      '--log=stdout'
    ], {
      shell: true,
      stdio: 'pipe'
    });

    // Capture ngrok output to display the URL
    ngrok.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);

      // Extract and highlight the public URL
      if (output.includes('Forwarding')) {
        const match = output.match(/https:\/\/[^\s]+/);
        if (match) {
          console.log('\n╔════════════════════════════════════════╗');
          console.log('║     🌐 NGROK TUNNEL ACTIVE 🌐          ║');
          console.log('╚════════════════════════════════════════╝');
          console.log(`\n🔗 Public URL: ${match[0]}`);
          console.log(`📍 Local URL:  http://localhost:3000`);
          console.log(`🌐 Dashboard:  http://127.0.0.1:4040`);
          console.log(`\n✅ Share this URL to access your API!\n`);
          console.log(`⚠️  Press Ctrl+C to stop\n`);
        }
      }
    });

    ngrok.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    // Handle cleanup
    const cleanup = () => {
      console.log('\n\n🛑 Shutting down...');
      server.kill();
      ngrok.kill();
      try {
        execSync('taskkill /F /IM ngrok.exe 2>nul', { stdio: 'ignore' });
      } catch (e) { }
      console.log('✅ Cleanup complete');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    server.on('exit', (code) => {
      if (code !== 0) {
        console.error('❌ Server crashed');
        cleanup();
      }
    });

    ngrok.on('exit', (code) => {
      if (code !== 0) {
        console.error('❌ ngrok stopped');
        cleanup();
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

startWithNgrok();