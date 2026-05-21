const { createProbot } = require("probot");
const app = require("../index");

module.exports = async (req, res) => {
  try {
    const probot = createProbot();
    await probot.load(app);
    
    // We need to fetch all installations to check their repositories
    const octokitApp = await probot.auth();
    const { data: installations } = await octokitApp.apps.listInstallations();

    for (const installation of installations) {
      const octokit = await probot.auth(installation.id);
      const { data: { repositories } } = await octokit.apps.listInstallationReposForAuthenticatedUser();
      
      for (const repo of repositories) {
        const owner = repo.owner.login;
        const repoName = repo.name;

        // Fetch open issues (excluding PRs)
        const { data: issues } = await octokit.issues.listForRepo({
          owner,
          repo: repoName,
          state: 'open',
          per_page: 100
        });

        for (const issue of issues) {
          // GitHub API returns PRs as issues, so we filter them out
          if (issue.pull_request) continue;

          const now = new Date();
          const createdAt = new Date(issue.created_at);
          const daysOld = (now - createdAt) / (1000 * 60 * 60 * 24);

          // Check for 2-day reminder
          if (daysOld >= 2 && !issue.assignee) {
            // Check if there are any PRs linked to this issue.
            // A simple way is to search for PRs that mention the issue number in the repo
            const q = `repo:${owner}/${repoName} is:pr mentions:${issue.user.login} ${issue.number}`;
            const { data: prSearch } = await octokit.search.issuesAndPullRequests({ q });

            if (prSearch.total_count === 0) {
              // No PR found, check if we already commented
              const { data: comments } = await octokit.issues.listComments({
                owner,
                repo: repoName,
                issue_number: issue.number
              });

              const hasReminder = comments.some(c => c.body.includes("friendly reminder") && c.user.type === "Bot");
              
              if (!hasReminder) {
                await octokit.issues.createComment({
                  owner,
                  repo: repoName,
                  issue_number: issue.number,
                  body: `Hi @${issue.user.login}, this is a friendly reminder. It's been 2 days since this issue was opened and we haven't seen a Pull Request addressing it. Please provide an update if you're still working on this, otherwise it might be assigned to someone else.`
                });
              }
            }
          }
        }
      }
    }

    res.status(200).send("Cron job executed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error executing cron job");
  }
};
