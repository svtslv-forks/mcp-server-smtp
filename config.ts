import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Define types for configurations
export interface SmtpServerConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  isDefault: boolean;
}

export interface RateLimitConfig {
  enabled: boolean;
  messagesPerMinute: number;
}

export interface SmtpConfig {
  smtpServers: SmtpServerConfig[];
  rateLimit: RateLimitConfig;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  isDefault: boolean;
}

export interface EmailLogEntry {
  timestamp: string;
  smtpConfig: string;
  templateId?: string;
  recipient: string;
  subject: string;
  success: boolean;
  message?: string;
}

// Define paths for configuration and data storage
export const CONFIG_DIR = path.join(os.homedir(), '.smtp-mcp-server');
export const TEMPLATES_DIR = path.join(CONFIG_DIR, 'templates');
export const SMTP_CONFIG_FILE = path.join(CONFIG_DIR, 'smtp-config.json');
export const LOG_FILE = path.join(CONFIG_DIR, 'email-logs.json');

// Default SMTP configuration
export const DEFAULT_SMTP_CONFIG: SmtpConfig = {
  smtpServers: [
    {
      id: 'aws-ses',
      name: 'AWS SES',
      host: 'email-smtp.us-east-1.amazonaws.com', // Update this to your actual AWS SES region
      port: 587,
      secure: false,
      auth: {
        user: 'AKIAXXXXXXXXXXX', // Replace with your AWS SES SMTP username (Access Key)
        pass: 'XXXXXXXXXXXXXXXX' // Replace with your AWS SES SMTP password (Secret Key)
      },
      isDefault: true
    },
    {
      id: 'gmail',
      name: 'Gmail SMTP',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'eugproductions@gmail.com',
        pass: 'rovt fswq crlv bhzk'
      },
      isDefault: false
    }
  ],
  rateLimit: {
    enabled: true,
    messagesPerMinute: 30
  }
};

// Default email template
export const DEFAULT_TEMPLATE: EmailTemplate = {
  id: 'default',
  name: 'Default Template',
  subject: 'Default Subject',
  body: 'Hello {{name}},\n\nThis is a default email template.\n\nBest regards,\nThe Team',
  isDefault: true
};

// IE Business School outreach template
export const IE_TEMPLATE: EmailTemplate = {
  id: 'ie-outreach',
  name: 'IE Business School Outreach',
  subject: 'Exclusive AI & Data Science Opportunity - IE Business School Students',
  body: `Dear {{name}},

I hope this email finds you well. I'm reaching out to a select group of IE Business School students in the Business Analytics & Big Data program.

We're looking for data science and AI enthusiasts to join our growing team for exciting projects combining business analytics with cutting-edge AI solutions.

Would you be available for a brief call to discuss this opportunity? I'd love to learn more about your experience and interests.

Best regards,
The Indosy Team
hello@indosy.com`,
  isDefault: false
};

// ESADE Business School outreach template
export const ESADE_TEMPLATE: EmailTemplate = {
  id: 'esade-outreach',
  name: 'ESADE Business School Outreach',
  subject: 'AI & Data Science Opportunity for ESADE Students',
  body: `Dear {{name}},

I hope your studies at ESADE Business School are going well. I'm reaching out to connect with talented MSc students interested in AI and data science.

Our company is expanding its data science team and looking for talented individuals with your academic background. We'd love to discuss potential opportunities with you.

Would you be interested in learning more? I'm available for a quick call at your convenience.

Best regards,
The Indosy Team
hello@indosy.com`,
  isDefault: false
};

/**
 * Ensure all necessary directories and config files exist
 */
export async function ensureConfigDirectories(): Promise<void> {
  try {
    // Create config directory if it doesn't exist
    await fs.ensureDir(CONFIG_DIR);
    await fs.ensureDir(TEMPLATES_DIR);
    
    // Create default SMTP config if it doesn't exist
    if (!await fs.pathExists(SMTP_CONFIG_FILE)) {
      await fs.writeJson(SMTP_CONFIG_FILE, DEFAULT_SMTP_CONFIG, { spaces: 2 });
    }
    
    // Create default template if it doesn't exist
    const defaultTemplatePath = path.join(TEMPLATES_DIR, 'default.json');
    if (!await fs.pathExists(defaultTemplatePath)) {
      await fs.writeJson(defaultTemplatePath, DEFAULT_TEMPLATE, { spaces: 2 });
    }
    
    // Create IE template if it doesn't exist
    const ieTemplatePath = path.join(TEMPLATES_DIR, 'ie-outreach.json');
    if (!await fs.pathExists(ieTemplatePath)) {
      await fs.writeJson(ieTemplatePath, IE_TEMPLATE, { spaces: 2 });
    }
    
    // Create ESADE template if it doesn't exist
    const esadeTemplatePath = path.join(TEMPLATES_DIR, 'esade-outreach.json');
    if (!await fs.pathExists(esadeTemplatePath)) {
      await fs.writeJson(esadeTemplatePath, ESADE_TEMPLATE, { spaces: 2 });
    }
    
    // Create log file if it doesn't exist
    if (!await fs.pathExists(LOG_FILE)) {
      await fs.writeJson(LOG_FILE, [], { spaces: 2 });
    }
  } catch (error) {
    console.error('Error ensuring config directories:', error);
    throw error;
  }
}

/**
 * Get SMTP configurations
 */
export async function getSmtpConfigs(): Promise<SmtpServerConfig[]> {
  try {
    const config = await fs.readJson(SMTP_CONFIG_FILE) as SmtpConfig;
    return config.smtpServers || [];
  } catch (error) {
    console.error('Error reading SMTP config:', error);
    return DEFAULT_SMTP_CONFIG.smtpServers;
  }
}

/**
 * Get default SMTP configuration
 */
export async function getDefaultSmtpConfig(): Promise<SmtpServerConfig> {
  const configs = await getSmtpConfigs();
  return configs.find(config => config.isDefault) || configs[0] || DEFAULT_SMTP_CONFIG.smtpServers[0];
}

/**
 * Save SMTP configurations
 */
export async function saveSmtpConfigs(configs: SmtpServerConfig[]): Promise<boolean> {
  try {
    const currentConfig = await fs.readJson(SMTP_CONFIG_FILE) as SmtpConfig;
    currentConfig.smtpServers = configs;
    await fs.writeJson(SMTP_CONFIG_FILE, currentConfig, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving SMTP config:', error);
    return false;
  }
}

/**
 * Get email templates
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const files = await fs.readdir(TEMPLATES_DIR);
    const templates: EmailTemplate[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const templatePath = path.join(TEMPLATES_DIR, file);
        const template = await fs.readJson(templatePath) as EmailTemplate;
        templates.push(template);
      }
    }
    
    return templates;
  } catch (error) {
    console.error('Error reading email templates:', error);
    return [DEFAULT_TEMPLATE, IE_TEMPLATE, ESADE_TEMPLATE];
  }
}

/**
 * Get default email template
 */
export async function getDefaultEmailTemplate(): Promise<EmailTemplate> {
  const templates = await getEmailTemplates();
  return templates.find(template => template.isDefault) || templates[0] || DEFAULT_TEMPLATE;
}

/**
 * Save email template
 */
export async function saveEmailTemplate(template: EmailTemplate): Promise<boolean> {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${template.id}.json`);
    await fs.writeJson(templatePath, template, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error saving email template:', error);
    return false;
  }
}

/**
 * Delete email template
 */
export async function deleteEmailTemplate(templateId: string): Promise<boolean> {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${templateId}.json`);
    await fs.remove(templatePath);
    return true;
  } catch (error) {
    console.error('Error deleting email template:', error);
    return false;
  }
}

/**
 * Log email activity
 */
export async function logEmailActivity(entry: EmailLogEntry): Promise<boolean> {
  try {
    let logs: EmailLogEntry[] = [];
    
    // Read existing logs if file exists
    if (await fs.pathExists(LOG_FILE)) {
      logs = await fs.readJson(LOG_FILE) as EmailLogEntry[];
    }
    
    // Add new log entry
    logs.push(entry);
    
    // Write updated logs
    await fs.writeJson(LOG_FILE, logs, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error logging email activity:', error);
    return false;
  }
}

/**
 * Get email logs
 */
export async function getEmailLogs(): Promise<EmailLogEntry[]> {
  try {
    if (await fs.pathExists(LOG_FILE)) {
      return await fs.readJson(LOG_FILE) as EmailLogEntry[];
    }
    return [];
  } catch (error) {
    console.error('Error reading email logs:', error);
    return [];
  }
} 