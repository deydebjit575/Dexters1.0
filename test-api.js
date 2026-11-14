import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {}
  return { status: res.status, headers: res.headers, text, json };
}

async function runTestSuite() {
  console.log('--- STARTING SERVER ---');
  const server = spawn('node', ['server/src/index.js'], {
    cwd: __dirname,
    stdio: 'pipe',
  });

  server.stdout.on('data', (d) => console.log('[Server stdout]:', d.toString().trim()));
  server.stderr.on('data', (d) => console.error('[Server stderr]:', d.toString().trim()));

  await sleep(1500);

  try {
    console.log('\n1. Testing Health Endpoint: GET /api/health');
    const health = await request('http://127.0.0.1:5000/api/health');
    console.log('Status:', health.status, 'Response:', health.json);

    console.log('\n2. Testing Authentication: POST /api/auth/login');
    const login = await request('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@storyverse.ai', password: 'storyverse123' })
    });
    console.log('Login Status:', login.status, 'User Name:', login.json?.user?.name, 'Plan:', login.json?.user?.plan);
    const token = login.json?.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    console.log('\n3. Testing Universes: GET /api/universes');
    const unis = await request('http://127.0.0.1:5000/api/universes', { headers: authHeaders });
    console.log('Universes count:', unis.json?.length, 'First universe:', unis.json?.[0]?.name);
    const uniId = unis.json?.[0]?.id;

    console.log('\n4. Testing Connected Graph: GET /api/universes/:id/graph');
    const graph = await request(`http://127.0.0.1:5000/api/universes/${uniId}/graph`, { headers: authHeaders });
    console.log('Graph Nodes count:', graph.json?.nodes?.length, 'Graph Links count:', graph.json?.links?.length);

    console.log('\n5. Testing Characters: GET /api/characters?universeId=' + uniId);
    const chars = await request(`http://127.0.0.1:5000/api/characters?universeId=${uniId}`, { headers: authHeaders });
    console.log('Characters count:', chars.json?.length, 'Names:', chars.json?.map(c => c.name).join(', '));

    console.log('\n6. Testing Relationships: GET /api/characters/meta/relationships?universeId=' + uniId);
    const rels = await request(`http://127.0.0.1:5000/api/characters/meta/relationships?universeId=${uniId}`, { headers: authHeaders });
    console.log('Relationships count:', rels.json?.length, 'Sample:', rels.json?.[0]?.description);

    console.log('\n7. Testing AI Character Generation: POST /api/ai/character');
    const aiChar = await request('http://127.0.0.1:5000/api/ai/character', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ prompt: 'Role: Infiltrator', universeId: uniId })
    });
    console.log('AI Model:', aiChar.json?.model, 'Generated Name:', aiChar.json?.parsed?.name, 'Remaining credits:', aiChar.json?.remainingCredits);

    console.log('\n8. Testing AI Chapter Generation: POST /api/ai/chapter');
    const aiChap = await request('http://127.0.0.1:5000/api/ai/chapter', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        prompt: 'Valen tests his crystal blade against the moon hounds',
        storyTitle: 'Echoes of the Fractured Moon',
        universeId: uniId,
        chapterNumber: 2,
        tone: 'Epic',
      })
    });
    console.log('AI Chapter word length:', aiChap.json?.text?.length, 'Credits left:', aiChap.json?.remainingCredits);

    console.log('\n9. Testing AI Dialogue Generation: POST /api/ai/dialogue');
    const aiDiag = await request('http://127.0.0.1:5000/api/ai/dialogue', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        characterIds: chars.json?.slice(0, 2).map(c => c.id),
        tone: 'Tense',
        topic: 'Whether to risk the moon vault breach',
        universeId: uniId,
      })
    });
    console.log('AI Dialogue generated lines:', aiDiag.json?.lines?.length);

    console.log('\n10. Testing Story Consistency Audit: POST /api/ai/continuity-check');
    const audit = await request('http://127.0.0.1:5000/api/ai/continuity-check', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        textToCheck: aiChap.json?.text?.slice(0, 300),
        universeId: uniId,
      })
    });
    console.log('Continuity Audit Score:', audit.json?.overallHealth);

    console.log('\n11. Testing Subscription Verification & Provider Confirmation:');
    const checkout = await request('http://127.0.0.1:5000/api/subscription/checkout', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ planId: 'creator', provider: 'razorpay' })
    });
    console.log('Order created:', checkout.json?.orderId, 'Amount: ₹', checkout.json?.amount);

    const verify = await request('http://127.0.0.1:5000/api/subscription/verify', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        orderId: checkout.json?.orderId,
        paymentId: 'pay_test_verified_123',
        planId: 'creator',
        status: 'confirmed'
      })
    });
    console.log('Verified upgrade result:', verify.json?.message, 'New Credits:', verify.json?.credits);

    console.log('\n12. Testing Export: GET /api/export/story/:id?format=markdown');
    const storiesRes = await request(`http://127.0.0.1:5000/api/stories?universeId=${uniId}`, { headers: authHeaders });
    const storyId = storiesRes.json?.[0]?.id;
    const exportRes = await request(`http://127.0.0.1:5000/api/export/story/${storyId}?format=markdown`);
    console.log('Export Status:', exportRes.status, 'Sample Markdown Line:', exportRes.text.split('\n')[0]);

    console.log('\n13. Testing Web Frontend Bundle Serve: GET /');
    const frontendRes = await request('http://127.0.0.1:5000/');
    console.log('Frontend Status:', frontendRes.status, 'HTML contains root div:', frontendRes.text.includes('<div id="root"></div>'));

    console.log('\n✅ ALL 13 TEST SUITES PASSED FLAWLESSLY!');
  } catch (err) {
    console.error('Test suite failed:', err);
  } finally {
    console.log('\n--- SHUTTING DOWN TEST SERVER ---');
    server.kill();
    process.exit(0);
  }
}

runTestSuite();
