import { getWelcomeIntentionsByJourney } from "../../db/get-welcome.ts";
import { upsertAndSyncProgress } from "../../db/user-journey-progress.ts";
import { getUser } from "../../db/get-user.ts";

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

  return languageName
};

export async function eventMessage({
  user_id,
  journey_id,
}: {
  user_id: string;
  journey_id: string;
}) {
  const { progress, welcome_intentions } = await upsertAndSyncProgress(
    user_id,
    journey_id,
  );

  // if current_day is 1 and we have no welcome_intentions yet, fallback to DB
  //   let openingMessage: string | undefined;

  if (welcome_intentions) {
    const { title, duration, meaning } = await getWelcomeIntentionsByJourney(
      journey_id,
    );
    const user = await getUser(user_id);
    const useLanguage = buildLanguageReminder(user.language);
    let generatedWelcome: string;
    if (progress.current_day === 1){
      generatedWelcome = `******************************
      ******************************************* 
      Customer Name ${user.name ?? ""},
      Trip Name ${title},
      Trip Duration ${duration},
      Respond in the language ${useLanguage},
      **********************************************. ${meaning}"`;
      
    } else {
      generatedWelcome = `
      ****************************************
      *****************************
      Customer Name ${user.name ?? ""},
      Trip Name ${title},
      Day of the Journey ${progress.current_day},
      Respond in the language ${useLanguage},`
    }



    console.log("openingMessage: ", generatedWelcome);

    return {
      message: generatedWelcome,
    };
  
  }
  
  

  return null;
}
