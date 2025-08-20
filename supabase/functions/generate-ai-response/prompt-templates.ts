import { fetchCurrentDay } from "../../db/get-current-day.ts";
import { getJourneyContext } from "../../db/get-journey-context.ts";
import { getJourneyDayTemplates } from "../../db/get-journey-day-templates.ts";
import { getUser } from "../../db/get-user.ts";
import { fetchLastInteractions } from "../../db/user-interactions.ts";
import { upsertAndSyncProgress } from "../../db/user-journey-progress.ts";
import { mapTemplateDays } from "./journey-day-templates.ts";

const buildLanguageReminder = (languageCode: string = "en"): string => {
  if (languageCode === "en") return "";

  const languageNames: Record<string, string> = {
    he: "Hebrew",
    ar: "Arabic",
    es: "Spanish",
    fr: "French",
    ru: "Russian",
  };

  const languageName = languageNames[languageCode] ?? languageCode;

  return `The user's most recent message was in ${languageName}. YOU MUST RESPOND IN ${languageName}.`;
};

export async function buildPrompt(payload: {
  user_id: string;
  journey_id: string;
  userLanguage: any;
}) {
  const { user_id, journey_id, userLanguage } = payload;

  let contextPrompt = ``;

  /** Basic instruction: Who are you, general tone, and length of response */
  const base_system_prompt = `
There should be a prompt system for the bot here.
`;

  const user = await getUser(user_id); // from users
  //ensure we have progress row and that 'current_day' is up-to-date
  let day = await fetchCurrentDay(user_id, journey_id); // from user_journey_progress
  if (!day) {
    const { progress } = await upsertAndSyncProgress(user_id, journey_id);
    day = progress.current_day;
  }

  //fetch journey-level data needed for the prompt
  const journeyCtx = await getJourneyContext(journey_id, day!); // from journeys and journey_days and journey_experiences
  //General definitions for days
  const templateDay = mapTemplateDays(journeyCtx.duration, day!);
  const template = await getJourneyDayTemplates(templateDay); // from journey_day_templates
  //Previous messages from the user
  const previousDaysInfo = await fetchLastInteractions(user_id, journey_id); // from ai_interactions

  console.log(
    "user: ",
    user,
    "progress: ",
    day,
    "journeyCtx: ",
    journeyCtx,
    "templateDey: ",
    templateDay,
    "template: ",
    template,
    "previousDaysInfo: ",
    previousDaysInfo
  );

  // Building the user and journey information
  let journeyUserInfo = "";

  // Basic information about the user and the journey
  const languageReminder = buildLanguageReminder(userLanguage);
  if (languageReminder) {
    journeyUserInfo += `${languageReminder} `;
  }

  journeyUserInfo += `The user ${
    user.name ?? ""
  } is on Day ${day} of the journey "${journeyCtx.title}". `;
  journeyUserInfo += `Journey description: ${journeyCtx.description}. `;

  // Adding travel experiences
  if (journeyCtx.experiences && Array.isArray(journeyCtx.experiences)) {
    const experiencesText = journeyCtx.experiences
      .map((exp) => {
        if (exp.experiences && Array.isArray(exp.experiences)) {
          return exp.experiences.join(", ");
        }
        return "";
      })
      .filter((text) => text.length > 0)
      .join(". ");

    if (experiencesText) {
      journeyUserInfo += `Journey includes: ${experiencesText}. `;
    }
  }

  // Check if this is the last day
  if (journeyCtx.duration === day) {
    journeyUserInfo += `This is the last day of the journey. `;
  }

  // Information about the current day
  journeyUserInfo += `This is a ${journeyCtx.duration}-day journey. `;
  journeyUserInfo += `Today's task: ${journeyCtx.day.title} - ${journeyCtx.day.content}. `;

  if (journeyCtx.day.guidance_text) {
    journeyUserInfo += `Guidance: ${journeyCtx.day.guidance_text}. `;
  }

  // Adding instructions from the template
  if (template && Array.isArray(template) && template.length > 0) {
    const todayTemplate = template.find((t) => t.day === day);
    if (todayTemplate) {
      journeyUserInfo += `Today's instructions: ${todayTemplate.instructions}. `;
      if (todayTemplate.questions) {
        journeyUserInfo += `Opening question: ${todayTemplate.questions}. `;
      }
    }
  }
  // Adding information about previous interactions
  if (previousDaysInfo && previousDaysInfo.length > 0) {
    journeyUserInfo += `Previous interactions: `;
    const recentInteractions = previousDaysInfo
      .slice(0, 5) // Take only the last 5 interactions
      .map((interaction) => {
        const userMsg = interaction.message_content?.substring(0, 100) || ""; // Limit to 100 characters
        const aiMsg = interaction.ai_response?.substring(0, 100) || "";
        return `User: "${userMsg}${
          userMsg.length > 100 ? "..." : ""
        }" AI: "${aiMsg}${aiMsg.length > 100 ? "..." : ""}"`;
      })
      .join("; ");
    journeyUserInfo += `${recentInteractions}. `;
  }

  console.log(`[Info] journeyUserInfo: `, journeyUserInfo);

  return { base_system_prompt, journeyUserInfo };
}
