import {ParseOptions, TestParser} from '../../test-parser'
import {parseStringPromise} from 'xml2js'

import {NunitReport, TestCase, TestSuite} from './dotnet-nunit-legacy-types'
import {getExceptionSource} from '../../utils/node-utils'
import {getBasePath, normalizeFilePath} from '../../utils/path-utils'

import {
  TestExecutionResult,
  TestRunResult,
  TestSuiteResult,
  TestGroupResult,
  TestCaseResult,
  TestCaseError
} from '../../test-results'

export class DotnetNunitLegacyParser implements TestParser {
  assumedWorkDir: string | undefined

  constructor(readonly options: ParseOptions) {}

  async parse(path: string, content: string): Promise<TestRunResult> {
    const ju = await this.getNunitReport(path, content)
    return this.getTestRunResult(path, ju)
  }

  private async getNunitReport(path: string, content: string): Promise<NunitReport> {
    try {
      return (await parseStringPromise(content)) as NunitReport
    } catch (e) {
      throw new Error(`Invalid XML at ${path}\n\n${e}`)
    }
  }

  private getTestRunResult(path: string, nunit: NunitReport): TestRunResult {
    const suites: TestSuiteResult[] = []

    this.populateTestCasesRecursive(suites, [], nunit['test-results']['test-suite'])

    return new TestRunResult(path, suites)
  }

  private populateTestCasesRecursive(
    result: TestSuiteResult[],
    suitePath: TestSuite[],
    testSuites: TestSuite[] | undefined
  ): void {
    if (testSuites === undefined) {
      return
    }

    for (const suite of testSuites) {
      if (!suite['results']) {
        continue
      }

      suitePath.push(suite)

      const results = suite['results'][0]

      this.populateTestCasesRecursive(result, suitePath, results['test-suite'])

      const testcases = results['test-case']
      if (testcases !== undefined) {
        for (const testcase of testcases) {
          this.addTestCase(result, suitePath, testcase)
        }
      }

      suitePath.pop()
    }
  }

  private addTestCase(result: TestSuiteResult[], suitePath: TestSuite[], testCase: TestCase): void {
    // The last suite in the suite path is the "group".
    // The rest are concatenated together to form the "suite".
    // But ignore "Theory" suites.
    const suitesWithoutTheories = suitePath.filter(suite => suite.$.type !== 'Theory')
    const suiteName = suitesWithoutTheories
      .filter(suite => suite.$.type !== 'Assembly' && suite.$.type !== 'Project')
      .map(suite => suite.$.name)
      .join('.')
    const groupName = suitesWithoutTheories[suitesWithoutTheories.length - 1].$.name

    let existingSuite = result.find(existingSuite => existingSuite.name === suiteName)
    if (existingSuite === undefined) {
      existingSuite = new TestSuiteResult(suiteName, [])
      result.push(existingSuite)
    }

    let existingGroup = existingSuite.groups.find(existingGroup => existingGroup.name === groupName)
    if (existingGroup === undefined) {
      existingGroup = new TestGroupResult(groupName, [])
      existingSuite.groups.push(existingGroup)
    }

    existingGroup.tests.push(
      new TestCaseResult(
        testCase.$.name.startsWith(suiteName + '.') ? testCase.$.name.substring(suiteName.length + 1) : testCase.$.name,
        this.getTestExecutionResult(testCase),
        testCase.$.time ? parseFloat(testCase.$.time) * 1000 : 0,
        this.getTestCaseError(testCase)
      )
    )
  }

  private getTestExecutionResult(test: TestCase): TestExecutionResult {
    if (test.$.result === 'Failed' || test.failure) return 'failed'
    if (test.$.result === 'Skipped' || test.$.result === 'Ignored' || test.$.result === 'Inconclusive') return 'skipped'
    return 'success'
  }

  private getTestCaseError(tc: TestCase): TestCaseError | undefined {
    if (
      !this.options.parseErrors ||
      ((!tc.failure || tc.failure.length === 0) && (!tc.reason || tc.reason.length === 0))
    ) {
      return undefined
    }

    const details = (tc.failure && tc.failure[0]) || (tc.reason && tc.reason[0])
    if (!details) {
      throw new Error('details is undefined')
    }

    let path
    let line

    if (details['stack-trace'] !== undefined && details['stack-trace'].length > 0) {
      const src = getExceptionSource(details['stack-trace'][0], this.options.trackedFiles, file =>
        this.getRelativePath(file)
      )
      if (src) {
        path = src.path
        line = src.line
      }
    }

    return {
      path,
      line,
      message: details.message && details.message.length > 0 ? details.message[0] : '',
      details: details['stack-trace'] && details['stack-trace'].length > 0 ? details['stack-trace'][0] : ''
    }
  }

  private getRelativePath(path: string): string {
    path = normalizeFilePath(path)
    const workDir = this.getWorkDir(path)
    if (workDir !== undefined && path.startsWith(workDir)) {
      path = path.substring(workDir.length)
    }
    return path
  }

  private getWorkDir(path: string): string | undefined {
    return (
      this.options.workDir ??
      this.assumedWorkDir ??
      (this.assumedWorkDir = getBasePath(path, this.options.trackedFiles))
    )
  }
}
