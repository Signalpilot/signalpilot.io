/**
 * API: A/B Testing
 * GET /api/social/ab-test?token=TOKEN&testName=name
 * 
 * Run and analyze A/B tests with statistical rigor
 */

import ABTest from '../../lib/social/ab-tester.js';

// Store tests in memory (in production, use database)
const tests = {};

export default async function handler(req, res) {
  const token = req.query.token;

  // Validate token
  if (!token || token !== process.env.SOCIAL_API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGetTest(req, res);
  } else if (req.method === 'POST') {
    return handleTestAction(req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteTest(req, res);
  }

  res.status(405).json({ error: 'Method not allowed' });
}

/**
 * GET /api/social/ab-test?token=TOKEN&testName=name&action=summary|export|list
 */
async function handleGetTest(req, res) {
  const { testName, action = 'summary' } = req.query;

  try {
    if (action === 'list') {
      const testList = Object.keys(tests).map((name) => ({
        name,
        status: tests[name].status,
        controlSize: tests[name].results.control.length,
        treatmentSize: tests[name].results.treatment.length,
      }));

      return res.status(200).json({
        success: true,
        data: testList,
        total: testList.length,
      });
    }

    if (!testName) {
      return res.status(400).json({ error: 'testName required' });
    }

    if (!tests[testName]) {
      return res.status(404).json({ error: `Test "${testName}" not found` });
    }

    const test = tests[testName];

    if (action === 'summary') {
      return res.status(200).json({
        success: true,
        data: test.getSummary(),
      });
    } else if (action === 'export') {
      return res.status(200).json({
        success: true,
        data: test.export(),
      });
    }

    res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/social/ab-test?token=TOKEN
 * Body: { testName, action: 'create'|'record'|'end', ... }
 */
async function handleTestAction(req, res) {
  const { testName, action, data } = req.body;

  try {
    if (action === 'create') {
      if (tests[testName]) {
        return res.status(400).json({ error: `Test "${testName}" already exists` });
      }

      const { controlGroup, treatmentGroup } = data;
      tests[testName] = new ABTest(testName, controlGroup, treatmentGroup);

      return res.status(201).json({
        success: true,
        message: `Test "${testName}" created`,
        test: tests[testName].getSummary(),
      });
    }

    if (!tests[testName]) {
      return res.status(404).json({ error: `Test "${testName}" not found` });
    }

    const test = tests[testName];

    if (action === 'record') {
      const { group, success, metadata } = data;
      test.recordResult(group, success, metadata);

      return res.status(200).json({
        success: true,
        message: 'Result recorded',
        stats: {
          controlCount: test.results.control.length,
          treatmentCount: test.results.treatment.length,
        },
      });
    } else if (action === 'end') {
      test.endTest();

      return res.status(200).json({
        success: true,
        message: `Test "${testName}" ended`,
        results: test.getSummary(),
      });
    } else if (action === 'reset') {
      test.reset();

      return res.status(200).json({
        success: true,
        message: `Test "${testName}" reset`,
      });
    }

    res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * DELETE /api/social/ab-test?token=TOKEN&testName=name
 */
async function handleDeleteTest(req, res) {
  const { testName } = req.query;

  try {
    if (!testName) {
      return res.status(400).json({ error: 'testName required' });
    }

    if (!tests[testName]) {
      return res.status(404).json({ error: `Test "${testName}" not found` });
    }

    delete tests[testName];

    res.status(200).json({
      success: true,
      message: `Test "${testName}" deleted`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
