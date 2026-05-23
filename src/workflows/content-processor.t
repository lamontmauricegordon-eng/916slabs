import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";

type Params = {
  action: "process-post" | "generate-summary" | "trigger-deploy" | "ai-enhance";
  slug?: string;
  content?: string;
  triggerDeploy?: boolean;
};

export class ContentProcessorWorkflow extends WorkflowEntrypoint<Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const { action, slug, content, triggerDeploy } = event.payload;

    console.log(`🚀 Starting 916slabs workflow: ${action} | Slug: ${slug || 'none'}`);

    // Step 1: Process Content
    const processed = await step.do("process-content", async () => {
      if (!content) throw new Error("Content is required for processing");

      const cleanedContent = content
        .replace(/<[^>]*>/g, "") 
        .replace(/\s+/g, " ")
        .trim();

      return {
        slug,
        processedContent: cleanedContent,
        wordCount: cleanedContent.split(/\s+/).length,
        timestamp: new Date().toISOString()
      };
    });

    // Step 2: AI Enhancement
    let aiResult = null;
    if (action === "ai-enhance" || action === "generate-summary") {
      aiResult = await step.do("ai-enhance", async () => {
        const aiResponse = await this.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          prompt: `You are a skilled technical blogger. Enhance the following content to be more engaging, clear, and SEO-friendly for a developer audience.\n\nContent: ${processed.processedContent}`,
          max_tokens: 600,
          temperature: 0.75
        });

        return {
          improvedContent: aiResponse.response || aiResponse,
          summary: (aiResponse.response || "").slice(0, 280) + "..."
        };
      });
    }

    // Step 3: Trigger Deployment (if requested)
    if (triggerDeploy || action === "trigger-deploy") {
      await step.do("trigger-deployment", async () => {
        console.log("🔄 Triggering new Pages deployment via workflow");
        // You can add a Deploy Hook URL here later
        return { deployed: true, timestamp: new Date().toISOString() };
      });
    }

    const finalResult = {
      success: true,
      action,
      slug,
      aiEnhanced: !!aiResult,
      ...aiResult,
      ...processed
    };

    console.log("✅ Workflow completed successfully", finalResult);
    return finalResult;
  }
}
