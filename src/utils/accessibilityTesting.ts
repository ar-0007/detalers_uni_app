import { ReactTestInstance } from 'react-test-renderer';
import { AccessibilityRole, AccessibilityState } from 'react-native';

// Types for accessibility testing
export interface AccessibilityTestResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface AccessibilityTestReport {
  componentName: string;
  testResults: AccessibilityTestResult[];
  score: number; // 0-100
  recommendations: string[];
}

export interface AccessibilityTestOptions {
  checkLabels?: boolean;
  checkRoles?: boolean;
  checkStates?: boolean;
  checkHints?: boolean;
  checkContrast?: boolean;
  strictMode?: boolean;
}

// Accessibility Testing Helper Class
export class AccessibilityTester {
  private static defaultOptions: AccessibilityTestOptions = {
    checkLabels: true,
    checkRoles: true,
    checkStates: true,
    checkHints: true,
    checkContrast: false, // Requires additional setup
    strictMode: false,
  };

  /**
   * Test a component's accessibility properties
   */
  static testComponent(
    component: ReactTestInstance,
    componentName: string,
    options: AccessibilityTestOptions = {}
  ): AccessibilityTestReport {
    const testOptions = { ...this.defaultOptions, ...options };
    const testResults: AccessibilityTestResult[] = [];
    const recommendations: string[] = [];

    // Test accessibility label
    if (testOptions.checkLabels) {
      const labelResult = this.testAccessibilityLabel(component);
      testResults.push(labelResult);
      if (!labelResult.passed) {
        recommendations.push('Add meaningful accessibilityLabel to improve screen reader support');
      }
    }

    // Test accessibility role
    if (testOptions.checkRoles) {
      const roleResult = this.testAccessibilityRole(component);
      testResults.push(roleResult);
      if (!roleResult.passed) {
        recommendations.push('Set appropriate accessibilityRole to help users understand element purpose');
      }
    }

    // Test accessibility state
    if (testOptions.checkStates) {
      const stateResult = this.testAccessibilityState(component);
      testResults.push(stateResult);
      if (!stateResult.passed && stateResult.severity === 'warning') {
        recommendations.push('Consider adding accessibilityState for interactive elements');
      }
    }

    // Test accessibility hint
    if (testOptions.checkHints) {
      const hintResult = this.testAccessibilityHint(component);
      testResults.push(hintResult);
      if (!hintResult.passed && hintResult.severity === 'warning') {
        recommendations.push('Add accessibilityHint for complex interactions');
      }
    }

    // Calculate score
    const score = this.calculateAccessibilityScore(testResults);

    return {
      componentName,
      testResults,
      score,
      recommendations,
    };
  }

  /**
   * Test accessibility label presence and quality
   */
  private static testAccessibilityLabel(component: ReactTestInstance): AccessibilityTestResult {
    const props = component.props;
    const label = props.accessibilityLabel;

    if (!label) {
      return {
        passed: false,
        message: 'Missing accessibilityLabel',
        severity: 'error',
      };
    }

    if (typeof label !== 'string' || label.trim().length === 0) {
      return {
        passed: false,
        message: 'accessibilityLabel must be a non-empty string',
        severity: 'error',
      };
    }

    if (label.length < 3) {
      return {
        passed: false,
        message: 'accessibilityLabel should be more descriptive (at least 3 characters)',
        severity: 'warning',
      };
    }

    if (label.length > 100) {
      return {
        passed: false,
        message: 'accessibilityLabel should be concise (under 100 characters)',
        severity: 'warning',
      };
    }

    return {
      passed: true,
      message: 'accessibilityLabel is properly set',
      severity: 'info',
    };
  }

  /**
   * Test accessibility role appropriateness
   */
  private static testAccessibilityRole(component: ReactTestInstance): AccessibilityTestResult {
    const props = component.props;
    const role = props.accessibilityRole;
    const componentType = typeof component.type === 'string' ? component.type : component.type.name || 'Unknown';

    if (!role) {
      return {
        passed: false,
        message: 'Missing accessibilityRole',
        severity: 'warning',
      };
    }

    const validRoles: AccessibilityRole[] = [
      'none', 'button', 'link', 'search', 'image', 'keyboardkey',
      'text', 'adjustable', 'imagebutton', 'header', 'summary',
      'alert', 'checkbox', 'combobox', 'menu', 'menubar',
      'menuitem', 'progressbar', 'radio', 'radiogroup',
      'scrollbar', 'spinbutton', 'switch', 'tab', 'tablist',
      'timer', 'toolbar'
    ];

    if (!validRoles.includes(role)) {
      return {
        passed: false,
        message: `Invalid accessibilityRole: ${role}`,
        severity: 'error',
      };
    }

    // Check role appropriateness based on component type
    const roleRecommendations: Record<string, AccessibilityRole[]> = {
      'TouchableOpacity': ['button', 'link'],
      'Pressable': ['button', 'link'],
      'Text': ['text', 'header'],
      'TextInput': ['search', 'text'],
      'Switch': ['switch'],
      'Image': ['image'],
    };

    const recommendations = roleRecommendations[componentType];
    if (recommendations && !recommendations.includes(role)) {
      return {
        passed: false,
        message: `Role '${role}' may not be appropriate for ${componentType}. Consider: ${recommendations.join(', ')}`,
        severity: 'warning',
      };
    }

    return {
      passed: true,
      message: 'accessibilityRole is appropriately set',
      severity: 'info',
    };
  }

  /**
   * Test accessibility state for interactive elements
   */
  private static testAccessibilityState(component: ReactTestInstance): AccessibilityTestResult {
    const props = component.props;
    const role = props.accessibilityRole;
    const state = props.accessibilityState;

    // Only check state for interactive elements
    const interactiveRoles = ['button', 'checkbox', 'switch', 'radio', 'tab'];
    if (!role || !interactiveRoles.includes(role)) {
      return {
        passed: true,
        message: 'accessibilityState not required for this element type',
        severity: 'info',
      };
    }

    if (!state) {
      return {
        passed: false,
        message: 'Interactive elements should have accessibilityState',
        severity: 'warning',
      };
    }

    // Validate state properties
    const validStateKeys = ['disabled', 'selected', 'checked', 'busy', 'expanded'];
    const stateKeys = Object.keys(state);
    const invalidKeys = stateKeys.filter(key => !validStateKeys.includes(key));

    if (invalidKeys.length > 0) {
      return {
        passed: false,
        message: `Invalid accessibilityState keys: ${invalidKeys.join(', ')}`,
        severity: 'error',
      };
    }

    return {
      passed: true,
      message: 'accessibilityState is properly configured',
      severity: 'info',
    };
  }

  /**
   * Test accessibility hint appropriateness
   */
  private static testAccessibilityHint(component: ReactTestInstance): AccessibilityTestResult {
    const props = component.props;
    const hint = props.accessibilityHint;
    const role = props.accessibilityRole;

    // Hints are optional but recommended for complex interactions
    if (!hint) {
      const complexRoles = ['button', 'link', 'adjustable'];
      if (role && complexRoles.includes(role)) {
        return {
          passed: false,
          message: 'Consider adding accessibilityHint for better user guidance',
          severity: 'warning',
        };
      }
      return {
        passed: true,
        message: 'accessibilityHint not required',
        severity: 'info',
      };
    }

    if (typeof hint !== 'string' || hint.trim().length === 0) {
      return {
        passed: false,
        message: 'accessibilityHint must be a non-empty string',
        severity: 'error',
      };
    }

    if (hint.length > 150) {
      return {
        passed: false,
        message: 'accessibilityHint should be concise (under 150 characters)',
        severity: 'warning',
      };
    }

    return {
      passed: true,
      message: 'accessibilityHint is properly set',
      severity: 'info',
    };
  }

  /**
   * Calculate accessibility score based on test results
   */
  private static calculateAccessibilityScore(results: AccessibilityTestResult[]): number {
    if (results.length === 0) return 0;

    let totalPoints = 0;
    let maxPoints = 0;

    results.forEach(result => {
      if (result.severity === 'error') {
        maxPoints += 30;
        if (result.passed) totalPoints += 30;
      } else if (result.severity === 'warning') {
        maxPoints += 20;
        if (result.passed) totalPoints += 20;
      } else {
        maxPoints += 10;
        if (result.passed) totalPoints += 10;
      }
    });

    return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
  }

  /**
   * Generate a comprehensive accessibility report
   */
  static generateReport(reports: AccessibilityTestReport[]): string {
    let output = '\n=== ACCESSIBILITY TEST REPORT ===\n\n';

    const totalScore = reports.length > 0 ? reports.reduce((sum, report) => sum + report.score, 0) / reports.length : 0;
    output += `Overall Score: ${Math.round(totalScore)}/100\n\n`;

    reports.forEach(report => {
      output += `Component: ${report.componentName}\n`;
      output += `Score: ${report.score}/100\n`;
      
      const errors = report.testResults.filter(r => r.severity === 'error' && !r.passed);
      const warnings = report.testResults.filter(r => r.severity === 'warning' && !r.passed);
      
      if (errors.length > 0) {
        output += `❌ Errors (${errors.length}):\n`;
        errors.forEach(error => output += `  - ${error.message}\n`);
      }
      
      if (warnings.length > 0) {
        output += `⚠️  Warnings (${warnings.length}):\n`;
        warnings.forEach(warning => output += `  - ${warning.message}\n`);
      }
      
      if (report.recommendations.length > 0) {
        output += `💡 Recommendations:\n`;
        report.recommendations.forEach(rec => output += `  - ${rec}\n`);
      }
      
      output += '\n';
    });

    return output;
  }
}

// Jest testing utilities
export const accessibilityMatchers = {
  /**
   * Check if component has accessibility label
   */
  toHaveAccessibilityLabel(received: any, expected?: string) {
    const label = received.props?.accessibilityLabel;
    
    if (expected) {
      const pass = label === expected;
      return {
        pass,
        message: () => {
          if (pass) {
            return `Expected component not to have accessibilityLabel "${expected}"`;
          }
          return `Expected component to have accessibilityLabel "${expected}", but got "${label}"`;
        }
      };
    }
    
    const pass = Boolean(label);
    return {
      pass,
      message: () => {
        if (pass) {
          return 'Expected component not to have accessibilityLabel';
        }
        return 'Expected component to have accessibilityLabel';
      }
    };
  },

  /**
   * Check if component has accessibility role
   */
  toHaveAccessibilityRole(received: any, expected: AccessibilityRole) {
    const role = received.props?.accessibilityRole;
    const pass = role === expected;
    
    return {
      pass,
      message: () => {
        if (pass) {
          return `Expected component not to have accessibilityRole "${expected}"`;
        }
        return `Expected component to have accessibilityRole "${expected}", but got "${role}"`;
      }
    };
  },

  /**
   * Check if component has accessibility state
   */
  toHaveAccessibilityState(received: any, expected: Partial<AccessibilityState>) {
    const state = received.props?.accessibilityState || {};
    
    const missingKeys = Object.keys(expected).filter(
      key => state[key as keyof AccessibilityState] !== expected[key as keyof AccessibilityState]
    );
    
    const pass = missingKeys.length === 0;
    
    return {
      pass,
      message: () => 
        pass 
          ? 'Expected component not to have matching accessibilityState'
          : `Expected component to have accessibilityState matching ${JSON.stringify(expected)}, but got ${JSON.stringify(state)}`
    };
  },

  /**
   * Check if component is accessible (passes basic accessibility tests)
   */
  toBeAccessible(received: any, options?: AccessibilityTestOptions) {
    const report = AccessibilityTester.testComponent(received, 'TestComponent', options);
    const errors = report.testResults.filter(r => r.severity === 'error' && !r.passed);
    const pass = errors.length === 0;
    
    return {
      pass,
      message: () => {
        if (pass) {
          return 'Expected component not to be accessible';
        }
        return `Component failed accessibility tests:\n${errors.map(e => `- ${e.message}`).join('\n')}`;
      }
    };
  }
};

// Example usage and test helpers
export const AccessibilityTestHelpers = {
  /**
   * Create a mock component with accessibility props for testing
   */
  createMockComponent(props: any = {}): ReactTestInstance {
    const mockComponent = {
      type: 'TouchableOpacity',
      props: {
        accessibilityLabel: 'Test Button',
        accessibilityRole: 'button' as AccessibilityRole,
        accessibilityState: { disabled: false },
        ...props
      },
      instance: null,
      parent: null,
      children: [],
      find: () => [],
      findByType: () => [],
      findByProps: () => [],
      findAll: () => [],
      findAllByType: () => [],
      findAllByProps: () => []
    };
    return mockComponent as unknown as ReactTestInstance;
  },

  /**
   * Quick accessibility check for development
   */
  quickCheck(component: ReactTestInstance, componentName: string = 'Component'): boolean {
    const report = AccessibilityTester.testComponent(component, componentName);
    const errors = report.testResults.filter(r => r.severity === 'error' && !r.passed);
    
    if (errors.length > 0) {
      console.warn(`Accessibility issues found in ${componentName}:`);
      errors.forEach(error => console.warn(`- ${error.message}`));
      return false;
    }
    
    return true;
  },

  /**
   * Log accessibility report to console
   */
  logReport(reports: AccessibilityTestReport[]) {
    console.log(AccessibilityTester.generateReport(reports));
  }
};