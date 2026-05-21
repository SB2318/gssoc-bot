# GSSoC GitHub Issue Management Bot

This is a [Probot](https://probot.github.io) application built for the GirlScript Summer of Code (GSSoC) to automate repository issue and contributor management.

## Features

1. **Contributor Greetings & Triage**
   - When a new issue is opened, the bot greets the user with issue guidelines.
   - It asks the contributor to specify the task level (e.g., **web development task** or **mobile task**).
   - If the issue is a web task, the bot automatically tags a designated mentor (`for example: @Gooichand`) for review.

2. **Assignment Rules Explanation**
   - When a user comments asking to work on an issue (using keywords like "assign", "can I work", "interested"), the bot automatically replies explaining that assignments are strictly **first come, first serve**.

3. **5-Day Assignment Deadline**
   - When a mentor officially assigns an issue to a contributor, the bot sets a strict 5-day deadline.
   - It sends a comment to the assignee letting them know that if they can't complete the task within those days, the issue will be reassigned to the next person in the queue.

4. **2-Day PR Reminder (Cron Job)**
   - The bot has a daily cron job that checks all open, unassigned issues.
   - If an issue has been open for 2 days and does not have any linked Pull Requests, the bot sends a friendly reminder asking for an update.

## Deployment (Vercel)

This bot is designed to be deployed as a serverless function on Vercel.

1. Create a GitHub App in your developer settings.
2. Deploy this repository to Vercel.
3. Configure the following environment variables in Vercel:
   - `APP_ID`: Your GitHub App ID
   - `PRIVATE_KEY`: Your GitHub App Private Key
   - `WEBHOOK_SECRET`: The secret you set for your GitHub App webhooks
4. Update your GitHub App's Webhook URL to point to `https://<your-vercel-domain>/api/github/webhooks`.

The daily cron job is configured via the `vercel.json` file.
