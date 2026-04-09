import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer';
import * as fs from 'fs/promises';

@Injectable()
export class InternationsService {
    private readonly logger = new Logger(InternationsService.name);
    private readonly credentials: { email: string; password: string };
    private readonly groupUrl: string;
    private readonly browserlessWs: string;

    constructor(private configService: ConfigService) {
        this.credentials = {
            email: this.configService.get<string>('internations.email')!,
            password: this.configService.get<string>('internations.password')!,
        };
        this.groupUrl = this.configService.get<string>('internations.groupUrl')!;
        this.browserlessWs = this.configService.get<string>('browserless.wsEndpoint')!;
    }

    private async saveScreenshot(page: any, name: string) {
        await fs.mkdir('debug', { recursive: true });
        await page.screenshot({ path: `debug/${name}.png`, fullPage: true });
        this.logger.log(`📸 Screenshot saved: debug/${name}.png`);
    }

    private delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async login(page: any): Promise<void> {
        this.logger.log('🔑 Logging into Internations...');
        await page.goto('https://www.internations.org/login', { waitUntil: 'networkidle2' });

        await page.type('input[type="email"], input[placeholder*="Email"]', this.credentials.email, { delay: 30 });
        await page.type('input[type="password"]', this.credentials.password, { delay: 30 });

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('button[type="submit"]'),
        ]);

        if (page.url().includes('login')) throw new Error('Login failed');
        this.logger.log('✅ Logged in successfully');
        await this.saveScreenshot(page, 'after-login');
    }

    async navigateToGroup(page: any): Promise<void> {
        this.logger.log(`🚀 Navigating to group: ${this.groupUrl}`);
        await page.goto(this.groupUrl, { waitUntil: 'networkidle2' });
        await this.saveScreenshot(page, 'group-page');
    }

    async createPost(page: any, post: { subject: string; body: string }): Promise<void> {
        this.logger.log('📝 Creating new forum thread...');

        await page.waitForSelector('button:has-text("Create thread"), a:has-text("Create thread")', { timeout: 15000 });
        await page.click('button:has-text("Create thread"), a:has-text("Create thread")');

        await this.delay(2000);

        await page.type('input[placeholder*="Subject"], input[name*="subject"]', post.subject, { delay: 30 });
        await page.type('textarea, div[role="textbox"], .ql-editor', post.body, { delay: 30 });

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
            page.click('button:has-text("Post"), button:has-text("Create"), button[type="submit"]'),
        ]);

        this.logger.log('✅ Post created!');
        await this.saveScreenshot(page, 'post-created');
    }

    async commentOnPost(page: any, postUrl: string, commentText: string): Promise<void> {
        this.logger.log(`💬 Commenting on: ${postUrl}`);
        await page.goto(postUrl, { waitUntil: 'networkidle2' });

        await page.type('textarea, div[role="textbox"]', commentText, { delay: 30 });
        await page.click('button:has-text("Comment"), button:has-text("Post comment"), button[type="submit"]');

        await this.delay(3000);
        this.logger.log('✅ Comment posted');
        await this.saveScreenshot(page, 'comment-posted');
    }

    async runAutomation(postData?: { subject: string; body: string }) {
        const browser = await puppeteer.connect({
            browserWSEndpoint: this.browserlessWs,
            defaultViewport: { width: 1280, height: 900 },
        });

        const page = await browser.newPage();

        try {
            await this.login(page);
            await this.navigateToGroup(page);

            if (postData) {
                await this.createPost(page, postData);
            }

            // Add more actions (comment, reply) here as needed
            this.logger.log('🎉 Automation completed successfully!');
        } catch (error) {
            this.logger.error(`❌ Automation failed: ${error.message}`);
            await this.saveScreenshot(page, `error-${Date.now()}`);
            throw error;
        } finally {
            await browser.close();
        }
    }
}