/**
 * Validation & Security Sanitization Service
 * Performs semantic validation, JSON structural checks, script injection guards,
 * and CSS sanitization to protect against unsafe configurations.
 */

import { DesignSystemConfig } from '../types/schema';
import { SchemaMigrationService, ValidationResult, ValidationIssue } from '../engine/SchemaMigrationService';

export class ValidationService {
  /**
   * Validate entire DesignSystemConfig structure
   */
  public static validate(config: unknown): ValidationResult {
    const baseResult = SchemaMigrationService.validate(config);
    if (!baseResult.isValid) return baseResult;

    const securityIssues = this.checkSecurityVulnerabilities(config as DesignSystemConfig);
    return {
      isValid: baseResult.isValid && securityIssues.length === 0,
      issues: [...baseResult.issues, ...securityIssues],
      appliedMigrations: baseResult.appliedMigrations,
    };
  }

  /**
   * Security audit to prevent XSS, script injection, or executable JS code in JSON
   */
  public static checkSecurityVulnerabilities(config: DesignSystemConfig): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const forbiddenPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onerror=, onclick=
      /eval\(/gi,
      /Function\(/gi,
    ];

    const inspectString = (str: string, path: string) => {
      for (const pattern of forbiddenPatterns) {
        if (pattern.test(str)) {
          issues.push({
            path,
            message: `پیکربندی شامل رشته‌های غیرمجاز اجرایی یا مشکوک به اسکریپت است: "${pattern.source}"`,
            severity: 'error',
          });
        }
      }
    };

    const traverse = (obj: any, currentPath = '') => {
      if (!obj) return;
      if (typeof obj === 'string') {
        inspectString(obj, currentPath);
      } else if (Array.isArray(obj)) {
        obj.forEach((item, idx) => traverse(item, `${currentPath}[${idx}]`));
      } else if (typeof obj === 'object') {
        Object.entries(obj).forEach(([key, val]) => traverse(val, currentPath ? `${currentPath}.${key}` : key));
      }
    };

    traverse(config, 'config');
    return issues;
  }

  /**
   * Validate a single node's layout and responsive settings
   */
  public static validateNode(node: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!node.id || typeof node.id !== 'string') errors.push('شناسه ویجت نامعتبر است');
    if (!node.componentId || typeof node.componentId !== 'string') errors.push('شناسه کامپوننت نامعتبر است');
    if (node.layout?.colSpan && (node.layout.colSpan < 1 || node.layout.colSpan > 12)) {
      errors.push('تعداد ستون‌های گرید باید بین ۱ تا ۱۲ باشد');
    }
    return { valid: errors.length === 0, errors };
  }
}
