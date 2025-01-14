import { test } from '@oclif/test';
import axios from 'axios';
import { expect } from 'chai';
import { stopProcesses } from '../libs/helpers';
const inquirer = require('inquirer');

const inquirerMock = (result) => {
  inquirer.prompt = () =>
    new Promise((resolve, reject) => {
      resolve(result);
    });
};

/**
 * Test file contains a broken export, with missing `lastMigration` and route methods
 */
describe('Data validation', () => {
  describe('Repair not accepted', () => {
    test
      .stderr()
      .do(() => {
        inquirerMock({ load: false });
      })
      .command(['start', '--data', './test/data/env-to-repair.json', '-i', '0'])
      .catch((context) => {
        expect(context.message).to.contain(
          "These environment's data are too old or not a valid Mockoon environment."
        );
      })
      .it('should throw an error if repair is not accepted');
  });

  describe('Repair accepted', () => {
    test
      .stdout()
      .do(() => {
        inquirerMock({ load: true });
      })
      .command(['start', '--data', './test/data/env-to-repair.json', '-i', '0'])
      .it(
        'should repair and start mock on port 3000 if repair is accepted',
        (context) => {
          expect(context.stdout).to.contain(
            'Mock started at http://localhost:3000 (pid: 0, name: mockoon-demo-api)'
          );
        }
      );

    test.it('should call GET /users endpoint and get a result', async () => {
      const call1 = await axios.get('http://localhost:3000/users');

      expect(call1.data).to.contain('ok');
    });

    stopProcesses('all', ['mockoon-demo-api']);
  });
});
