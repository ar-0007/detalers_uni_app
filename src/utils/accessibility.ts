import { AccessibilityRole, AccessibilityState, AccessibilityActionInfo } from 'react-native';

// Accessibility Types and Interfaces
export interface AccessibilityProps {
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  accessibilityRole?: AccessibilityRole | undefined;
  accessibilityState?: AccessibilityState | undefined;
  accessibilityValue?: {
    min?: number | undefined;
    max?: number | undefined;
    now?: number | undefined;
    text?: string | undefined;
  } | undefined;
  accessibilityActions?: AccessibilityActionInfo[] | undefined;
  accessible?: boolean | undefined;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants' | undefined;
  accessibilityElementsHidden?: boolean | undefined;
  accessibilityViewIsModal?: boolean | undefined;
  accessibilityIgnoresInvertColors?: boolean | undefined;
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive' | undefined;
  accessibilityLanguage?: string | undefined;
}

export interface AccessibilityConfig {
  label: string;
  hint?: string;
  role?: AccessibilityRole;
  state?: AccessibilityState;
  value?: AccessibilityProps['accessibilityValue'];
  actions?: AccessibilityActionInfo[];
}

// Common Accessibility Roles
export const AccessibilityRoles = {
  BUTTON: 'button' as AccessibilityRole,
  LINK: 'link' as AccessibilityRole,
  TEXT: 'text' as AccessibilityRole,
  HEADER: 'header' as AccessibilityRole,
  IMAGE: 'image' as AccessibilityRole,
  IMAGEBUTTON: 'imagebutton' as AccessibilityRole,
  KEYBOARDKEY: 'keyboardkey' as AccessibilityRole,
  NONE: 'none' as AccessibilityRole,
  SEARCH: 'search' as AccessibilityRole,
  SUMMARY: 'summary' as AccessibilityRole,
  TABLIST: 'tablist' as AccessibilityRole,
  TAB: 'tab' as AccessibilityRole,
  TABPANEL: 'tabpanel' as AccessibilityRole,
  TIMER: 'timer' as AccessibilityRole,
  TOOLBAR: 'toolbar' as AccessibilityRole,
  MENU: 'menu' as AccessibilityRole,
  MENUBAR: 'menubar' as AccessibilityRole,
  MENUITEM: 'menuitem' as AccessibilityRole,
  PROGRESSBAR: 'progressbar' as AccessibilityRole,
  RADIO: 'radio' as AccessibilityRole,
  RADIOGROUP: 'radiogroup' as AccessibilityRole,
  SCROLLBAR: 'scrollbar' as AccessibilityRole,
  SPINBUTTON: 'spinbutton' as AccessibilityRole,
  SWITCH: 'switch' as AccessibilityRole,
  TEXTINPUT: 'textinput' as AccessibilityRole,
  ADJUSTABLE: 'adjustable' as AccessibilityRole,
  ALERT: 'alert' as AccessibilityRole,
  CHECKBOX: 'checkbox' as AccessibilityRole,
  COMBOBOX: 'combobox' as AccessibilityRole,
  GRID: 'grid' as AccessibilityRole,
  LIST: 'list' as AccessibilityRole,
  LISTITEM: 'listitem' as AccessibilityRole,
} as const;

// Common Accessibility States
export const AccessibilityStates = {
  DISABLED: { disabled: true },
  SELECTED: { selected: true },
  CHECKED: { checked: true },
  UNCHECKED: { checked: false },
  EXPANDED: { expanded: true },
  COLLAPSED: { expanded: false },
  BUSY: { busy: true },
} as const;

// Accessibility Utility Class
export class AccessibilityHelper {
  // Generate accessibility props for buttons
  static button(config: {
    label: string;
    hint?: string;
    disabled?: boolean;
    selected?: boolean;
  }): AccessibilityProps {
    return {
      accessibilityLabel: config.label,
      accessibilityHint: config.hint,
      accessibilityRole: AccessibilityRoles.BUTTON,
      accessibilityState: {
        disabled: config.disabled || false,
        selected: config.selected || false,
      },
      accessible: true,
    };
  }

  // Generate accessibility props for text inputs
  static textInput(config: {
    label: string;
    hint?: string;
    value?: string;
    required?: boolean;
    invalid?: boolean;
  }): AccessibilityProps {
    return {
      accessibilityLabel: config.label,
      accessibilityHint: config.hint,
      // Note: 'textinput' is not a valid accessibilityRole on Android
      // TextInput components handle accessibility automatically
      accessibilityState: {
        disabled: false,
      },
      accessibilityValue: config.value ? { text: config.value } : undefined,
      accessible: true,
    };
  }

  // Generate accessibility props for headers
  static header(config: {
    label: string;
    level?: number;
  }): AccessibilityProps {
    return {
      accessibilityLabel: config.label,
      accessibilityRole: AccessibilityRoles.HEADER,
      accessibilityValue: config.level ? { text: `Heading level ${config.level}` } : undefined,
      accessible: true,
    };
  }

  // Generate accessibility props for images
  static image(config: {
    label: string;
    decorative?: boolean;
  }): AccessibilityProps {
    if (config.decorative) {
      return {
        accessible: false,
        importantForAccessibility: 'no',
      };
    }

    return {
      accessibilityLabel: config.label,
      accessibilityRole: AccessibilityRoles.IMAGE,
      accessible: true,
    };
  }

  // Generate accessibility props for links
  static link(config: {
    label: string;
    hint?: string;
  }): AccessibilityProps {
    return {
      accessibilityLabel: config.label,
      accessibilityHint: config.hint || 'Double tap to open link',
      accessibilityRole: AccessibilityRoles.LINK,
      accessible: true,
    };
  }

  // Generate accessibility props for tabs
  static tab(config: {
    label: string;
    selected?: boolean;
    index?: number;
    total?: number;
  }): AccessibilityProps {
    const hint = config.index !== undefined && config.total !== undefined 
      ? `Tab ${config.index + 1} of ${config.total}` 
      : undefined;

    return {
      accessibilityLabel: config.label,
      accessibilityHint: hint,
      accessibilityRole: AccessibilityRoles.TAB,
      accessibilityState: {
        selected: config.selected || false,
      },
      accessible: true,
    };
  }

  // Generate accessibility props for lists
  static list(config: {
    label?: string;
    itemCount?: number;
  }): AccessibilityProps {
    const label = config.label || 
      (config.itemCount !== undefined ? `List with ${config.itemCount} items` : 'List');

    return {
      accessibilityLabel: label,
      accessibilityRole: AccessibilityRoles.LIST,
      accessible: true,
    };
  }

  // Generate accessibility props for list items
  static listItem(config: {
    label: string;
    index?: number;
    total?: number;
    selected?: boolean;
  }): AccessibilityProps {
    let label = config.label;
    if (config.index !== undefined && config.total !== undefined) {
      label += `. Item ${config.index + 1} of ${config.total}`;
    }

    return {
      accessibilityLabel: label,
      accessibilityRole: AccessibilityRoles.LISTITEM,
      accessibilityState: {
        selected: config.selected || false,
      },
      accessible: true,
    };
  }

  // Generate accessibility props for switches/toggles
  static switch(config: {
    label: string;
    value: boolean;
    hint?: string;
  }): AccessibilityProps {
    return {
      accessibilityLabel: config.label,
      accessibilityHint: config.hint,
      accessibilityRole: AccessibilityRoles.SWITCH,
      accessibilityState: {
        checked: config.value,
      },
      accessibilityValue: {
        text: config.value ? 'On' : 'Off',
      },
      accessible: true,
    };
  }

  // Generate accessibility props for checkboxes
  static checkbox(config: {
    label: string;
    checked: boolean;
    hint?: string;
  }): AccessibilityProps {
    return {
      accessibilityLabel: config.label,
      accessibilityHint: config.hint,
      accessibilityRole: AccessibilityRoles.CHECKBOX,
      accessibilityState: {
        checked: config.checked,
      },
      accessible: true,
    };
  }

  // Generate accessibility props for progress indicators
  static progressBar(config: {
    label: string;
    value?: number;
    min?: number;
    max?: number;
  }): AccessibilityProps {
    return {
      accessibilityLabel: config.label,
      accessibilityRole: AccessibilityRoles.PROGRESSBAR,
      accessibilityValue: {
        min: config.min || 0,
        max: config.max || 100,
        now: config.value || 0,
      },
      accessible: true,
    };
  }

  // Generate accessibility props for alerts
  static alert(config: {
    label: string;
    liveRegion?: 'polite' | 'assertive';
  }): AccessibilityProps {
    return {
      accessibilityLabel: config.label,
      accessibilityRole: AccessibilityRoles.ALERT,
      accessibilityLiveRegion: config.liveRegion || 'polite',
      accessible: true,
    };
  }

  // Combine multiple accessibility props
  static combine(...props: AccessibilityProps[]): AccessibilityProps {
    return props.reduce((combined, current) => {
      return {
        ...combined,
        ...current,
        accessibilityState: {
          ...combined.accessibilityState,
          ...current.accessibilityState,
        },
        accessibilityValue: {
          ...combined.accessibilityValue,
          ...current.accessibilityValue,
        },
      };
    }, {});
  }

  // Create accessible announcement
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): AccessibilityProps {
    return {
      accessibilityLiveRegion: priority,
      accessibilityLabel: message,
      accessible: true,
    };
  }

  // Hide element from screen readers
  static hide(): AccessibilityProps {
    return {
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
    };
  }

  // Make element focusable but not readable
  static focusable(label?: string): AccessibilityProps {
    return {
      accessible: true,
      accessibilityLabel: label || '',
      importantForAccessibility: 'yes',
    };
  }
}

// Color Contrast Utilities
export class ColorContrastHelper {
  // Calculate relative luminance
  static calculateLuminance(color: string): number {
    // Remove # if present
    const hex = color.replace(/^#/, '');
    
    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Apply gamma correction
    const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    // Calculate luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  // Calculate contrast ratio between two colors
  static getContrastRatio(color1: string, color2: string): number {
    const l1 = this.calculateLuminance(color1);
    const l2 = this.calculateLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Check if contrast ratio meets WCAG AA standards
  static meetsWCAGAA(color1: string, color2: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  // Check if contrast ratio meets WCAG AAA standards
  static meetsWCAGAAA(color1: string, color2: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  // Get accessible text color for background
  static getAccessibleTextColor(backgroundColor: string, lightColor: string = '#FFFFFF', darkColor: string = '#000000'): string {
    const lightRatio = this.getContrastRatio(backgroundColor, lightColor);
    const darkRatio = this.getContrastRatio(backgroundColor, darkColor);
    return lightRatio > darkRatio ? lightColor : darkColor;
  }
}

// Focus Management Utilities
export class FocusManager {
  private static focusedElement: any = null;

  // Set focus to element
  static setFocus(element: any): void {
    if (element && element.focus) {
      element.focus();
      this.focusedElement = element;
    }
  }

  // Get currently focused element
  static getFocusedElement(): any {
    return this.focusedElement;
  }

  // Clear focus
  static clearFocus(): void {
    if (this.focusedElement && this.focusedElement.blur) {
      this.focusedElement.blur();
    }
    this.focusedElement = null;
  }

  // Move focus to next element
  static focusNext(): void {
    // Implementation would depend on navigation structure
    console.log('Focus moved to next element');
  }

  // Move focus to previous element
  static focusPrevious(): void {
    // Implementation would depend on navigation structure
    console.log('Focus moved to previous element');
  }
}

// Screen Reader Utilities
export class ScreenReaderHelper {
  // Announce message to screen reader
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    // In React Native, this would typically be handled by setting accessibilityLiveRegion
    console.log(`Screen reader announcement (${priority}): ${message}`);
  }

  // Check if screen reader is enabled (mock implementation)
  static isScreenReaderEnabled(): boolean {
    // In a real implementation, this would check device settings
    return true; // Mock return
  }

  // Format text for screen reader
  static formatForScreenReader(text: string): string {
    return text
      .replace(/&/g, 'and')
      .replace(/@/g, 'at')
      .replace(/#/g, 'number')
      .replace(/\$/g, 'dollar')
      .replace(/%/g, 'percent')
      .replace(/\+/g, 'plus')
      .replace(/=/g, 'equals');
  }
}

// Accessibility Testing Helpers
export class AccessibilityTester {
  // Test if element has required accessibility properties
  static testAccessibility(element: any): {
    passed: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check for accessibility label
    if (!element.accessibilityLabel) {
      issues.push('Missing accessibilityLabel');
      suggestions.push('Add descriptive accessibilityLabel');
    }

    // Check for appropriate role
    if (!element.accessibilityRole) {
      issues.push('Missing accessibilityRole');
      suggestions.push('Add appropriate accessibilityRole');
    }

    // Check if accessible is set
    if (element.accessible === undefined) {
      suggestions.push('Consider explicitly setting accessible property');
    }

    return {
      passed: issues.length === 0,
      issues,
      suggestions,
    };
  }

  // Generate accessibility report
  static generateReport(elements: any[]): {
    totalElements: number;
    accessibleElements: number;
    issues: string[];
    score: number;
  } {
    const results = elements.map(el => this.testAccessibility(el));
    const accessibleElements = results.filter(r => r.passed).length;
    const allIssues = results.flatMap(r => r.issues);
    
    return {
      totalElements: elements.length,
      accessibleElements,
      issues: allIssues,
      score: elements.length > 0 ? (accessibleElements / elements.length) * 100 : 0,
    };
  }
}

// Export convenience functions
export const a11y = AccessibilityHelper;
export const contrast = ColorContrastHelper;
export const focus = FocusManager;
export const screenReader = ScreenReaderHelper;
export const a11yTest = AccessibilityTester;

// Default export
export default {
  AccessibilityHelper,
  ColorContrastHelper,
  FocusManager,
  ScreenReaderHelper,
  AccessibilityTester,
  AccessibilityRoles,
  AccessibilityStates,
  a11y,
  contrast,
  focus,
  screenReader,
  a11yTest,
};