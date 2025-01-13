import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class DashboardController extends Controller {
  @service router;
  @service session;
  @service s3Upload;
  @service search;
  @service pocketbase;

  @tracked isProfileOpen = false;
  @tracked selectedChannelId = null;
  @tracked selectedUserId = null;
  @tracked messages = [];
  @tracked isThreadVisible = false;
  @tracked selectedMessage = null;
  @tracked replies = [];
  @tracked isLoadingReplies = false;
  @tracked userStatus = 'active';
  @tracked messageText = '';
  @tracked replyText = '';

  @tracked isMessageEmojiPickerVisible = false;
  @tracked reactMsgRowIndex = null;

  @tracked searchText = '';
  @tracked isSearchPopupVisible = false;
  @tracked isSearching = false;
  @tracked searchResults = {
    users: [],
    messages: []
  };

  @tracked messagesSubscription = null;
  @tracked repliesSubscription = null;
  @tracked channelSubscription = null;
  @tracked userStatusSubscription = null;

  @tracked isAddChannelModalVisible = false;
  @tracked newChannelName = '';
  @tracked selectedUserIds = [];
  
  @tracked channels = [];
  @tracked directMessages = [];
  @tracked users = [];

  @tracked isAddDirectMessageModalVisible = false;
  @tracked selectedDMUserIds = [];

  @tracked activeReactionMessageId = null;

  @tracked isUploading = false;
  @tracked fileToUpload = null;

  @tracked isMobileMenuOpen = false;

  @tracked isAIColumnVisible = true;

  @tracked agentMessages = [{
    isAgent: true,
    message: "Hi! I'm Devin, an AI assistant at ChatGenius. I can do things like search for information and summarize records. What can I help you with?",
    timestamp: "11:30 AM",
    sender: "Agent Devin"
  }];

  @tracked aiMessageText = '';

  // Add this array of sample messages
  sampleMessages = [
    {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:22.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:25.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:28.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:31.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:34.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:37.401567"
  },
  {
      "body": "Sam Altman was talking about AGI timelines again. Wild stuff!",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:40.401567"
  },
  {
      "body": "Sam Altman was talking about AGI timelines again. Wild stuff!",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:43.401567"
  },
  {
      "body": "I wonder if OpenAI's focus will shift more towards enterprise solutions.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:46.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:49.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:52.401567"
  },
  {
      "body": "OpenAI's ChatGPT API has made my work so much faster.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:55.401567"
  },
  {
      "body": "Sam Altman mentioned regulation is essential, but will it even happen?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:16:58.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:01.401567"
  },
  {
      "body": "I wonder if OpenAI's focus will shift more towards enterprise solutions.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:04.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:07.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:10.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:13.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:16.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:19.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:22.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:25.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:28.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:31.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:34.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:37.401567"
  },
  {
      "body": "Sam Altman mentioned regulation is essential, but will it even happen?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:40.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:43.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:46.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:49.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:52.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:55.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:17:58.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:01.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:04.401567"
  },
  {
      "body": "Sam Altman mentioned regulation is essential, but will it even happen?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:07.401567"
  },
  {
      "body": "OpenAI's ChatGPT API has made my work so much faster.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:10.401567"
  },
  {
      "body": "OpenAI's ChatGPT API has made my work so much faster.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:13.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:16.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:19.401567"
  },
  {
      "body": "I wonder if OpenAI's focus will shift more towards enterprise solutions.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:22.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:25.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:28.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:31.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:34.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:37.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:40.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:43.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:46.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:49.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:52.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:55.401567"
  },
  {
      "body": "Has anyone tried OpenAI\u2019s Whisper for transcription? It's amazing.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:18:58.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:01.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:04.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:07.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:10.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:13.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:16.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:19.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:22.401567"
  },
  {
      "body": "Sam Altman was talking about AGI timelines again. Wild stuff!",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:25.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:28.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:31.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:34.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:37.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:40.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:43.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:46.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:49.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:52.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:55.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:19:58.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:01.401567"
  },
  {
      "body": "Sam Altman mentioned regulation is essential, but will it even happen?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:04.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:07.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:10.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:13.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:16.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:19.401567"
  },
  {
      "body": "Sam Altman mentioned regulation is essential, but will it even happen?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:22.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:25.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:28.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:31.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:34.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:37.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:40.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:43.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:46.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:49.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:52.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:55.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:20:58.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:01.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:04.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:07.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:10.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:13.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:16.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:19.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:22.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:25.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:28.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:31.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:34.401567"
  },
  {
      "body": "The way OpenAI is tackling AI ethics is really impressive.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:37.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:40.401567"
  },
  {
      "body": "OpenAI's ChatGPT API has made my work so much faster.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:43.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:46.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:49.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:52.401567"
  },
  {
      "body": "Has anyone tried OpenAI\u2019s Whisper for transcription? It's amazing.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:55.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:21:58.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:01.401567"
  },
  {
      "body": "Sam Altman was talking about AGI timelines again. Wild stuff!",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:04.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:07.401567"
  },
  {
      "body": "I read somewhere that OpenAI is hiring for 100+ roles. That\u2019s insane!",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:10.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:13.401567"
  },
  {
      "body": "Do you think OpenAI will collaborate with more universities this year?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:16.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:19.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:22.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:25.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:28.401567"
  },
  {
      "body": "Has anyone tried OpenAI\u2019s Whisper for transcription? It's amazing.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:31.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:34.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:37.401567"
  },
  {
      "body": "OpenAI's ChatGPT API has made my work so much faster.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:40.401567"
  },
  {
      "body": "Has anyone tried OpenAI\u2019s Whisper for transcription? It's amazing.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:43.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:46.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:49.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:52.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:55.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:22:58.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:01.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:04.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:07.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:10.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:13.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:16.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:19.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:22.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:25.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:28.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:31.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:34.401567"
  },
  {
      "body": "Do you think GPT-5 will be released this year?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:37.401567"
  },
  {
      "body": "Sam Altman was talking about AGI timelines again. Wild stuff!",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:40.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:43.401567"
  },
  {
      "body": "Has anyone tried OpenAI\u2019s Whisper for transcription? It's amazing.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:46.401567"
  },
  {
      "body": "OpenAI's ChatGPT API has made my work so much faster.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:49.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:52.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:55.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:23:58.401567"
  },
  {
      "body": "Sam Altman mentioned regulation is essential, but will it even happen?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:01.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:04.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:07.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:10.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:13.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:16.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:19.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:22.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:25.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:28.401567"
  },
  {
      "body": "Sam Altman mentioned regulation is essential, but will it even happen?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:31.401567"
  },
  {
      "body": "Has anyone tried OpenAI\u2019s Whisper for transcription? It's amazing.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:34.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:37.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:40.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:43.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:46.401567"
  },
  {
      "body": "Sam Altman was talking about AGI timelines again. Wild stuff!",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:49.401567"
  },
  {
      "body": "Has anyone tried OpenAI\u2019s Whisper for transcription? It's amazing.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:52.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:55.401567"
  },
  {
      "body": "Has anyone tried OpenAI\u2019s Whisper for transcription? It's amazing.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:24:58.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:01.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:04.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:07.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "r4t7c07089q2479",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:10.401567"
  },
  {
      "body": "I wonder if OpenAI's focus will shift more towards enterprise solutions.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:13.401567"
  },
  {
      "body": "Sam Altman always seems so calm when discussing existential risks.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:16.401567"
  },
  {
      "body": "OpenAI's research papers are such a good read for understanding AI trends.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:19.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:22.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:25.401567"
  },
  {
      "body": "Sam Altman seems to think AI can solve global challenges. Optimistic or na\u00efve?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:28.401567"
  },
  {
      "body": "Did you see the latest thing Sam Altman said about AI governance?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:31.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:34.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "8w59al64sg5jx84",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:37.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:40.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:43.401567"
  },
  {
      "body": "OpenAI's ChatGPT API has made my work so much faster.",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:46.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:49.401567"
  },
  {
      "body": "OpenAI's ChatGPT API has made my work so much faster.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:52.401567"
  },
  {
      "body": "Sam Altman once said AI could be the biggest unlock for humanity. Do you agree?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:55.401567"
  },
  {
      "body": "How much do you think OpenAI spends on cloud computing? Must be insane!",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:25:58.401567"
  },
  {
      "body": "OpenAI Codex is like having a superpowered dev assistant.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:26:01.401567"
  },
  {
      "body": "OpenAI's DALL\u00b7E 3 is my new favorite tool for creating content.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:26:04.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "69mn4i30zji1b88",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:26:07.401567"
  },
  {
      "body": "Do you think OpenAI's approach to safety is too cautious or just right?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:26:10.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:26:13.401567"
  },
  {
      "body": "OpenAI's GPT keeps getting better, but I\u2019m curious where it goes next.",
      "user": "g0048ghv9r5dc39",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:26:16.401567"
  },
  {
      "body": "Sam Altman\u2019s vision for universal basic income is tied to AI. Thoughts?",
      "user": "86d5j69l7062510",
      "channel": "ko67ktf7oxi6jyh",
      "timestamp": "2025-01-13T23:26:19.401567"
  }
  ];

  init() {
    super.init(...arguments);

    this.loadUsers();
    this.loadInitialData();
  
    // Start listening for messages when dashboard initializes
    this.messageSubscription = this.subscribeToMessages();
    this.repliesSubscription = this.subscribeToReplies();
    this.channelSubscription = this.subscribeToChannels();
    this.userStatusSubscription = this.subscribeToUserStatus();
  }

  async loadInitialData() {
    try {
      await this.pocketbase.authSuperUser();
    } catch(e) {
      console.log(e);
    }

    try {
      // Load all data in parallel
      const [channels, directMessages, users] = await Promise.all([
        this.pocketbase.getChannels(),
        this.pocketbase.getMyDirectChannels(),
        this.pocketbase.getUsers()
      ]);

      // Set the data
      this.channels = channels;
      this.directMessages = directMessages;
      this.users = users;

      setTimeout(() => {
        if (this.channels?.length > 0) {
          this.selectChannel(this.channels[0].id);
        }
      }, 10);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }

  async subscribeToUserStatus() {
    return this.pocketbase.client
      .collection('users')
      .subscribe('*', async (data) => {
        let directChannels = await this.pocketbase.getMyDirectChannels();
        this.directMessages = directChannels;
      });
  }

  async subscribeToChannels() {
    return this.pocketbase.client
      .collection('channels')
      .subscribe('*', async (data) => {
        
      try {
        const [channels, directChannels] = await Promise.all([
          this.pocketbase.getMyChannels(),
          this.pocketbase.getMyDirectChannels()
        ]);

        this.channels = channels;
        this.directMessages = directChannels;
        
      } catch (error) {
        console.error('Failed to reload channels:', error);
      }
        
      });
  }

  async subscribeToMessages() {
    return this.pocketbase.client
      .collection('messages')
      .subscribe('*', async (data) => {
        if (data.action === 'create') {
          // let message = data.record;
          // let user = await this.pocketbase.getUser(message.user);
          // message.expand = {};
          // message.expand.user = user; 

          let message = await this.pocketbase.getMessage(data.record.id);
  
          if (message.directMessage) {
            if (this.selectedUserId === message.directMessageId) {
              this.messages = [...this.messages, message];
            }
          } 
          else if (message.channel) {
            if (this.selectedChannelId === message.channel) {
              this.messages = [...this.messages, message];
            }
          }
        }

        if (data.action === 'update') {
          let messageIndex = this.messages.findIndex(msg => msg.id === data.record.id);
          if (messageIndex !== -1) {
            const updatedMessage = {
              ...this.messages[messageIndex],
              replyCount: (this.messages[messageIndex].replyCount || 0) + 1
            };

            this.messages = [
              ...this.messages.slice(0, messageIndex),
              updatedMessage,
              ...this.messages.slice(messageIndex + 1)
            ];
          }  
        }
      });
  }

  async subscribeToReplies() {
    return this.pocketbase.client
      .collection('replies')
      .subscribe('*', async (data) => {

        
        if (data.action === 'create') {
          if (this.isThreadVisible === true) {
            if (data.record.user !== this.pocketbase.currentUser.id) {
              const replies = await this.pocketbase.getReplies(data.record.message);
              this.replies = [];
              this.replies = replies;
            }
          }
        }      
      });
  }

  willDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.repliesSubscription.unsubscribe();
    }
    
    if (this.channelSubscription) {
      this.channelSubscription.unsubscribe();
    }
  }

  @action
  async selectChannel(channelId) {
    this.selectedChannelId = channelId;
    this.selectedUserId = null;
    this.isThreadVisible = false; // Hide thread when changing channels
    try {
      const messages = await this.pocketbase.getChannelMessages(this.selectedChannelId);
      this.messages = [];
      this.messages = messages;

    } catch (error) {
      console.error('Error loading messages:', error);
      this.messages = [];
    }
  }

  @action
  async selectUser(userId) {
    this.selectedUserId = userId;
    this.selectedChannelId = null;
    this.isThreadVisible = false; // Hide thread when changing DMs
    try {     
      const messages = await this.pocketbase.getDirectMessages(this.selectedUserId);
      this.messages = messages;
    } catch(error) {
      this.messages = [];
    }
  }

  @action
  async showThread(message) {
    this.selectedMessage = message;
    this.isThreadVisible = true;
    this.isLoadingReplies = true;
    
    try {
      const replies = await this.pocketbase.getReplies(message.id);
      this.replies = replies;
    } catch (error) {
      console.error('Error loading replies:', error);
      this.replies = [];
    } finally {
      this.isLoadingReplies = false;
    }
  }

  @action
  closeThread() {
    this.isThreadVisible = false;
    this.selectedMessage = null;
  }

  @action
  async logout() {
    await this.session.invalidate();
  }

  @action
  updateMessageText(event) {
    this.messageText = event.target.value;
  }

  @action
  addEmojiToMessage(emoji) {
    this.messageText = `${this.messageText}${emoji}`;
    this.isMessageEmojiPickerVisible = false;
  }

  @action
  addEmojiToChat(emoji) {
    // this.messageText = `${this.messageText}${emoji}`;
    // this.isMessageEmojiPickerVisible = false;
  }

  @action
  scrollToBottom() {
    const messageContainer = document.querySelector('.messages-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }

  @action
  async handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.isUploading = true;

      await this.pocketbase.createMessage({
        body: this.messageText || '',
        channelId: this.selectedChannelId,
        directMessageId: this.selectedUserId,
        file: file  // Pass the file directly
      });

      // Clear the input
      event.target.value = '';
      this.messageText = '';
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.isUploading = false;
    }
  }

  @action
  async postMessage() {
    if (!this.messageText && !this.fileToUpload) return;

    try {
      await this.pocketbase.createMessage({
        body: this.messageText,
        channelId: this.selectedChannelId,
        directMessageId: this.selectedUserId,
        file: this.fileToUpload
      });

      this.messageText = '';
      this.fileToUpload = null;
    } catch (error) {
      console.error('Failed to post message:', error);
    }
  }

  @action
  updateReplyText(event) {
    this.replyText = event.target.value;
  }

  @action
  async postReply() {
    if (!this.replyText.trim() || !this.selectedMessage) return;
    let newReply = {
      body: this.replyText,
      user: this.pocketbase.currentUser.id,
      message: this.selectedMessage.id
    }

    try {
      // create reply
      await this.pocketbase.client.collection('replies').create(newReply);

      // increment reply counts
      let msg = await this.pocketbase.client.collection('messages').getOne(this.selectedMessage.id);
      msg.replyCount = (msg.replyCount || 0) + 1;
      await this.pocketbase.client.collection('messages').update(this.selectedMessage.id, msg);

      // add user to newReply (for initials)
      newReply.expand = {};
      newReply.expand.user = {};
      newReply.expand.user = this.pocketbase.currentUser;
      this.replies = [...this.replies, newReply];
      this.isThreadVisible = true;

      this.replyText = '';
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  }

  @action
  async updateSearchText(event) {
    this.searchText = event.target.value;
    this.isSearchPopupVisible = this.searchText.length > 0;
    
    if (this.searchText.length >= 2) {
      this.isSearching = true;
      
      try {
        // Run both searches in parallel
        const [users, messages] = await Promise.all([
          this.pocketbase.searchUsers(this.searchText),
          this.pocketbase.searchMessages(this.searchText)
        ]);
        
        this.searchResults = { users, messages };
      } catch (error) {
        console.error('Search failed:', error);
        this.searchResults = { users: [], messages: [] };
      } finally {
        this.isSearching = false;
      }
    } else {
      this.searchResults = { users: [], messages: [] };
    }
  }

  @action
  clearSearch() {
    this.searchText = '';
    this.isSearchPopupVisible = false;
    this.selectedSearchResult = null;
  }

  @action
  focusSearch() {
    if (this.selectedSearchResult) {
      this.selectedSearchResult = null;
    }
    this.isSearchPopupVisible = this.searchText.length > 0;
  }

  @action
  selectSearchResult(result) {
    this.selectedSearchResult = result;
    this.isSearchPopupVisible = false;
  }

  @action
  closeFullScreenPopup() {
    this.selectedSearchResult = null;
    this.searchText = '';
    this.isSearchPopupVisible = false;
  }

  async loadUsers() {
    this.users = await this.pocketbase.getUsers();
  }

  @action
  showAddChannelModal() {
    this.isAddChannelModalVisible = true;
  }

  @action
  hideAddChannelModal() {
    this.isAddChannelModalVisible = false;
    this.newChannelName = '';
    this.selectedUserIds = [];
  }

  @action
  updateChannelName(event) {
    this.newChannelName = event.target.value;
  }

  @action
  updateSelectedUsers(event) {
    const selectedOptions = Array.from(event.target.selectedOptions);
    this.selectedUserIds = selectedOptions.map(option => option.getAttribute('user-id'));
    
  }

  @action
  async createChannel() {
    if (!this.isValidChannel) return;
    
    try {
      // Make sure we're getting user IDs, not names
      const userIds = [...this.selectedUserIds, this.pocketbase.currentUser.id];
      
      
      await this.pocketbase.createChannel({
        name: this.newChannelName.trim(),
        users: userIds // This will now contain actual user IDs
      });
      
      // Reset and close modal
      this.hideAddChannelModal();
      
      // refresh
      let channels = await this.pocketbase.getMyChannels();
      this.channels = channels;
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  }

  get isValidChannel() {
    return this.newChannelName.trim() && this.selectedUserIds.length > 0;
  }

  @action
  showAddDirectMessageModal() {
    this.isAddDirectMessageModalVisible = true;
  }

  @action
  hideAddDirectMessageModal() {
    this.isAddDirectMessageModalVisible = false;
    this.selectedDMUserIds = [];
  }

  @action
  updateSelectedDMUsers(event) {
    const selectedOptions = Array.from(event.target.selectedOptions);
    this.selectedDMUserIds = selectedOptions.map(option => option.value);
  }

  @action
  async createDirectMessage() {
    if (!this.isValidDirectMessage) return;

    try {
      // Add current user to the selected users
      const userIds = [...this.selectedDMUserIds, this.pocketbase.currentUser.id];
      await this.pocketbase.createDirectChannel(userIds);

      this.hideAddDirectMessageModal();

      let directChannels = await this.pocketbase.getMyDirectChannels();
      this.directMessages = directChannels;
    } catch (error) {
      console.error('Failed to create direct message:', error);
    }
  }

  get isValidDirectMessage() {
    return this.selectedDMUserIds.length > 0;
  }

  @action
  async addReaction(messageId, emoji) {
    try {
      // create reaction
      const data = {
        message: messageId,
        user: this.pocketbase.currentUser.id,
        emoji: emoji
      };
      const reaction = await this.pocketbase.client.collection('reactions').create(data);

      // add reaction to message
      let message = await this.pocketbase.client.collection('messages').getOne(messageId);
      message.reactions = [...message.reactions, reaction.id];
      await this.pocketbase.client.collection('messages').update(messageId, message);

      // fetch messages
      let messages = [];
      if (this.selectedChannelId) {
        messages = await this.pocketbase.getChannelMessages(this.selectedChannelId);
      } else if (this.selectedUserId) {
        messages = await this.pocketbase.getDirectMessages(this.selectedUserId);
      }
      this.messages = messages;
      this.activeReactionMessageId = null;
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }

  @action
  openMobileMenu() {
    this.isMobileMenuOpen = true;
  }

  @action
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  @action
  toggleAIColumn() {
    this.isAIColumnVisible = !this.isAIColumnVisible;
  }

  @action
  closeAIColumn() {
    this.isAIColumnVisible = false;
  }

  @action
  updateAIMessageText(event) {
    this.aiMessageText = event.target.value;
  }

  @action
  sendAIMessage() {
    if (!this.aiMessageText.trim()) return;
    
    this.agentMessages = [...this.agentMessages, {
      isAgent: false,
      message: this.aiMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: "User"
    }];
    
    this.aiMessageText = '';
  }

  @action
  async populateMessages() {
    let final = [];
    try {
      for (const message of this.sampleMessages) {
        let randomUser = ["g0048ghv9r5dc39", "69mn4i30zji1b88", "8w59al64sg5jx84", "r4t7c07089q2479", "86d5j69l7062510"][Math.floor(Math.random() * 5)];

        let msg = {
          body:message.body, 
          channelId:message.channel, 
          directMessageId: null, 
          file: null,
          user: randomUser
        }
        final.push(msg);


        await this.pocketbase.createMessage({
          body:message.body, 
          channelId:message.channel, 
          directMessageId: null, 
          file: null,
          user: randomUser
        });
      }
      console.log(JSON.stringify(final));
    } catch (error) {
      console.error('Failed to populate messages:', error);
    }
  }
} 


