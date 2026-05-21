/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info("GSSoC Bot was loaded!");

  // 1. Greet new issues
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: `Hello @${context.payload.issue.user.login}!\n\nThanks for opening this issue! Please make sure to read our issue guidelines.\n\nCould you please let us know the level of this task? Mention if it is a **web development task** or a **mobile task**. \n\n*If you select a web task, our mentor @Gooichand will look into it.*\n\nOur mentors will update you shortly on whether it is necessary or not.`,
    });
    return context.octokit.issues.createComment(issueComment);
  });

  // 4. Auto-reply to assignment requests
  app.on("issue_comment.created", async (context) => {
    // Ignore comments from bots
    if (context.payload.comment.user.type === "Bot") return;

    const commentBody = context.payload.comment.body.toLowerCase();
    
    // Check if the user is asking to be assigned
    const assignKeywords = ['assign', 'can i work', 'interested', 'would like to work'];
    const wantsAssignment = assignKeywords.some(keyword => commentBody.includes(keyword));

    if (wantsAssignment) {
      const reply = context.issue({
        body: `Hi @${context.payload.comment.user.login}, thanks for your interest!\n\n**Issue Assignment Rules:**\nAssignments are strictly **first come first serve**. Please wait for a mentor to officially assign the issue to you before you start working.`,
      });
      return context.octokit.issues.createComment(reply);
    }
  });

  // 3. Set 5-day deadline on assignment
  app.on("issues.assigned", async (context) => {
    const assignee = context.payload.assignee.login;
    const comment = context.issue({
      body: `Congratulations @${assignee}! This issue has been assigned to you.\n\nYou have **5 days** from now to complete this task. If you can't complete it within those days, the issue will be reassigned to the next person in the queue. Happy coding!`,
    });
    return context.octokit.issues.createComment(comment);
  });
};
