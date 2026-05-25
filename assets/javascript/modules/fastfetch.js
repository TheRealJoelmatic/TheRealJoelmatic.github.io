






window.Site = window.Site || {};


window.Site.PROFILE = {
  user: 'joel',
  host: 'portfolio',
};


(function () {
  var bday = new Date(2009, 2, 1); 
  var now  = new Date();
  var age  = now.getFullYear() - bday.getFullYear();
  if (now.getMonth() < 2 || (now.getMonth() === 2 && now.getDate() < 1)) { age--; }
  window.Site._age = String(age);
}());


window.Site.ABOUT_INFO = [
  { key: 'Name',    val: 'Joel',                 accent: 'c-blue'   },
  { key: 'Age',     val: window.Site._age,        accent: 'c-blue' },
  { key: 'Country', val: 'England, London',              accent: 'c-blue'  },
  { key: '', val: '',              accent: 'c-blue'  },
  { key: 'Focus',   val: 'Cyber Security',   accent: 'c-yellow'   },
  { key: 'Skills',   val: 'Reverse engineering and sys internals ',   accent: 'c-yellow'   },
  { key: 'Rep', val: 'Over 200+ vouches',          accent: 'c-yellow'   },
  { key: 'Languages',  val: 'C++, C',          accent: 'c-yellow' },
  { key: 'Experience', val: '3 years + loads of projects',          accent: 'c-yellow'   },

  { key: '', val: '',              accent: 'c-blue'  },
  { key: 'GitHub',  val: '@TheRealJoelmatic',     accent: 'c-peach'  },
  { key: 'Discord', val: '@joelmatic',            accent: 'c-peach'  },
  { key: 'Email', val: 'joelmaticbusiness@gmail.com',            accent: 'c-peach'  },

];


window.Site.COLOR_PALETTE = [
  '#f38ba8', 
  '#a6e3a1', 
  '#f9e2af', 
  '#89b4fa', 
  '#cba6f7', 
  '#89dceb', 
  '#1e1e2e', 
  '#313244', 
  '#585b70', 
  '#cdd6f4', 
];


window.Site.ASCII_ART = [
  '**********************#************',
  '**************##%%%%%##************',
  '************#%%@@@@@@@@%%#*********',
  '**********##%@@@@@@@@@@@%%##*******',
  '**********#%@@%@@@@@@@@@%##********',
  '**********#%%#=*##*#%@@@@%##*******',
  '**********##%#::::::-*#@%###*******',
  '************#%=:::::-%%%%##********',
  '*************##=:::::-***#*********',
  '*************-:::::::......=*******',
  '*********+-.....:::...........=****',
  '********-......................****',
  '********-......................****',
  '********:......................****',
  '********:......................+***',
  '********:......................+***',
  '********:......................+***',
  '*******+:......................+***',
  '********-......................+***',
  '*******+:......................****',
  '*******-......................=****',
  '******+......................:*****',
  '******:......................******',
  '*****+......................=******',
  '*****-...............::....:*******',
  '******+-=#############=::::+*******',
  '******##################*+*********',
  '******#####################********',
  '******######################*******',
  '*****#######################*******',
].join('\n');


window.Site.LINKS = {
  internal: [
    { label: 'portfolio',  switchTab: 'work',    icon: 'fa-solid fa-briefcase' },
    { label: 'vouches',    switchTab: 'vouches', icon: 'fa-solid fa-star'      },
  ],
  external: [
    { label: 'github.com',        href: 'https://github.com/TheRealJoelmatic',                      icon: 'fa-brands fa-github'       },
    { label: 'unknowncheats.me',  href: 'https://www.unknowncheats.me/forum/members/4739560.html', icon: 'fa-solid fa-shield-halved' },
    { label: 'wakatime.com',      href: 'https://wakatime.com/@Joelmatic',                          icon: 'fa-solid fa-clock'         },
    { label: 'jmsolutions.dev',   href: 'https://jmsolutions.dev/',                                 icon: 'fa-solid fa-globe'         },
  ],
  contact: [
    { label: 'discord',  copy: '@joelmatic',                   icon: 'fa-brands fa-discord' },
    { label: 'email',    copy: 'joelmaticbusiness@gmail.com',  icon: 'fa-solid fa-envelope' },
  ],
};


window.Site.VOUCHES = [
  'assets/vouches/Screenshot 2024-11-27 174848.png',
  'assets/vouches/Screenshot 2024-11-27 174904.png',
  'assets/vouches/Screenshot 2024-11-27 174919.png',
  'assets/vouches/Screenshot 2024-11-27 174932.png',
  'assets/vouches/Screenshot 2024-11-27 174945.png',
  'assets/vouches/Screenshot 2024-11-27 175002.png',
  'assets/vouches/Screenshot 2024-11-27 175017.png',
  'assets/vouches/Screenshot 2024-11-27 175031.png',
  'assets/vouches/Screenshot 2024-11-27 175046.png',
  'assets/vouches/Screenshot 2024-11-27 175103.png',
  'assets/vouches/Screenshot 2024-11-27 175115.png',
  'assets/vouches/Screenshot 2024-11-27 175128.png',
  'assets/vouches/Screenshot 2024-11-27 175150.png',
  'assets/vouches/Screenshot 2024-11-27 175202.png',
  'assets/vouches/Screenshot 2024-11-27 175223.png',
  'assets/vouches/Screenshot 2024-11-27 175242.png',
  'assets/vouches/Screenshot 2024-11-27 175256.png',
  'assets/vouches/Screenshot 2024-11-27 175311.png',
  'assets/vouches/Screenshot 2024-11-27 175324.png',
  'assets/vouches/Screenshot 2024-11-27 175338.png',
  'assets/vouches/Screenshot 2024-11-27 175354.png',
  'assets/vouches/Screenshot 2024-11-27 175408.png',
  'assets/vouches/Screenshot 2024-11-27 175418.png',
  'assets/vouches/Screenshot 2024-11-27 175435.png',
  'assets/vouches/Screenshot 2024-11-27 175456.png',
  'assets/vouches/Screenshot 2024-11-27 175508.png',
  'assets/vouches/Screenshot 2024-11-27 175526.png',
  'assets/vouches/Screenshot 2024-11-27 175540.png',
  'assets/vouches/Screenshot 2024-11-27 175550.png',
  'assets/vouches/Screenshot 2024-11-27 175653.png',
  'assets/vouches/Screenshot 2024-12-14 174642.png',
  'assets/vouches/Screenshot 2024-12-14 174705.png',
  'assets/vouches/Screenshot 2024-12-14 174716.png',
  'assets/vouches/Screenshot 2025-01-02 230253.png',
  'assets/vouches/Screenshot 2025-01-02 230318.png',
  'assets/vouches/Screenshot 2025-01-02 230336.png',
  'assets/vouches/Screenshot 2025-01-02 230345.png',
];


window.Site.WORK = [
  
  {
    name:   'RemoveAdblockThing',
    desc:   'Bypass YouTube\'s ad-blocker detection. 6,000+ GitHub stars.',
    tags:   ['JavaScript', 'Browser'],
    url:    'https://github.com/TheRealJoelmatic/RemoveAdblockThing',
    img:    'assets/work/Thumbnail.jpg',
    icon:   'fa-brands fa-youtube',
    accent: 'c-red',
  },
  {
    name:   'JM Solutions',
    desc:   'Game integrity & anti-cheat platform. Kernel-level security tooling, 40k+ injections.',
    tags:   ['C++', 'C', 'ASM', 'Kernel'],
    url:    null,
    icon:   'fa-solid fa-shield-halved',
    accent: 'c-blue',
  },
  {
    name:   'This Portfolio',
    desc:   'Hyprland / Wayland desktop simulation — built with vanilla HTML, CSS and JS.',
    tags:   ['HTML', 'CSS', 'JS'],
    url:    'index.html',
    icon:   'fa-solid fa-desktop',
    accent: 'c-mauve',
  },
  
  { section: 'Open Source' },
  {
    name:   'Matic Hook',
    desc:   'Function hooking to bypass anticheat hooks (NtProtectVirtualMemory).',
    tags:   ['C++', 'Hooking'],
    url:    'https://github.com/TheRealJoelmatic/maticHook',
    img:    'assets/work/hooked.png',
    icon:   'fa-solid fa-fish-fins',
    accent: 'c-green',
  },
  {
    name:   'lazy-function-pointer-encryptor',
    desc:   'Compile-time encrypted function pointer obfuscation to hide API calls.',
    tags:   ['C++', 'ASM', 'Obfuscation'],
    url:    'https://github.com/TheRealJoelmatic/lazy-function-pointer-encryptor',
    icon:   'fa-solid fa-key',
    accent: 'c-yellow',
  },
  {
    name:   'apex-matic',
    desc:   'External Apex Legends cheat using read-only memory techniques.',
    tags:   ['C++', 'External'],
    url:    'https://github.com/TheRealJoelmatic/apex-matic',
    icon:   'fa-solid fa-crosshairs',
    accent: 'c-red',
  },
  {
    name:   '1v1.lol Cheat',
    desc:   'Internal C++ Unity (IL2CPP) cheat for 1v1.lol.',
    tags:   ['C++', 'IL2CPP', 'Unity'],
    url:    'https://github.com/TheRealJoelmatic/1v1.lol-cheat',
    img:    'assets/work/1v1.lol.PNG',
    icon:   'fa-solid fa-gamepad',
    accent: 'c-green',
  },
  {
    name:   'ImGui External Base',
    desc:   'Clean ImGui-based external cheat base for rapid game tool development.',
    tags:   ['C++', 'ImGui'],
    url:    'https://github.com/TheRealJoelmatic/ImGui-External-Base',
    icon:   'fa-solid fa-layer-group',
    accent: 'c-mauve',
  },
  {
    name:   'Combat Master Unlocker',
    desc:   'Internal C# Unity (IL2CPP) unlock all for Combat Masters.',
    tags:   ['C#', 'IL2CPP', 'Unity'],
    url:    'https://github.com/TheRealJoelmatic/Combat-Master-Unlocker',
    img:    'assets/work/Unlock.jpg',
    icon:   'fa-solid fa-unlock',
    accent: 'c-blue',
  },
  {
    name:   'Matic Clicker',
    desc:   'Minecraft auto-clicker in C++ with bypasses for MMC & Hypixel.',
    tags:   ['C++', 'Minecraft'],
    url:    'https://github.com/TheRealJoelmatic/Matic-Clicker',
    img:    'assets/work/Autoclicker.jpg',
    icon:   'fa-solid fa-computer-mouse',
    accent: 'c-green',
  },
  {
    name:   'Eraser Trainer',
    desc:   'Internal C# Unity (Mono) mod menu for the platformer game Eraser.',
    tags:   ['C#', 'Mono', 'Unity'],
    url:    'https://github.com/TheRealJoelmatic/Eraser-Trainer',
    img:    'assets/work/easer.PNG',
    icon:   'fa-solid fa-wand-magic-sparkles',
    accent: 'c-mauve',
  },
  {
    name:   'McNameChecker',
    desc:   'Fast Minecraft name checker in C++ with proxy & multi-threading support.',
    tags:   ['C++', 'Minecraft', 'Async'],
    url:    'https://github.com/TheRealJoelmatic/McNameChecker',
    img:    'assets/work/mmc.PNG',
    icon:   'fa-solid fa-magnifying-glass',
    accent: 'c-yellow',
  },
  
  { section: 'Closed Source' },
  {
    name:   'Combat Master Cheat',
    desc:   'Most advanced cheat. Anti-cheat hiding, disabling most checks. 40k+ injections. (Internal C++, C, ASM)',
    tags:   ['C++', 'C', 'ASM', 'Kernel'],
    url:    null,
    img:    'assets/work/combatmaster.png',
    icon:   'fa-solid fa-shield-halved',
    accent: 'c-red',
  },
  {
    name:   'CS2 Cheat',
    desc:   'Fully external read-only cheat. Kernel bypass + overlay hijacking + NtUserInjectMouseInput hook.',
    tags:   ['C++', 'Kernel', 'External'],
    url:    null,
    img:    'assets/work/cs2.png',
    icon:   'fa-solid fa-crosshairs',
    accent: 'c-red',
  },
  {
    name:   'CoD Cold War: Unlock All',
    desc:   'Undetected usermode DLL injection bypass. Unlocks all items. 6k+ injections.',
    tags:   ['C++', 'Injection'],
    url:    'https://youtube.com/watch?v=3lL8AnZKTwk',
    img:    'assets/work/cw.jpg',
    icon:   'fa-solid fa-star',
    accent: 'c-yellow',
  },
  {
    name:   'R6 Siege Chams',
    desc:   'See players through walls. Kernel DLL injector bypassing BattleEye. (Nvidia GPU only)',
    tags:   ['C++', 'Kernel', 'BattleEye'],
    url:    'https://msware.sellpass.io/products/Rainbow--siege-Chams',
    img:    'assets/work/r6.jpg',
    icon:   'fa-solid fa-eye',
    accent: 'c-blue',
  },
  {
    name:   'Matic Ghost',
    desc:   'Minecraft cheat engineered to be fully undetectable during screenshare investigations.',
    tags:   ['Java', 'Minecraft', 'OPSEC'],
    url:    'https://streamable.com/lyv6ij',
    img:    'assets/work/matic ghost.PNG',
    icon:   'fa-solid fa-ghost',
    accent: 'c-mauve',
  },
  {
    name:   'Tassomai Bot',
    desc:   'Automatically completes Tassomai homework assignments at the click of a button.',
    tags:   ['Automation'],
    url:    'https://msware.sellpass.io/products/Tassmai-Hack',
    img:    'assets/work/tassmai.jpg',
    icon:   'fa-solid fa-robot',
    accent: 'c-green',
  },
  {
    name:   'UC Public Releases',
    desc:   'Open-source tools and research published on UnknownCheats.',
    tags:   ['C++', 'ASM', 'Reversing'],
    url:    'https://www.unknowncheats.me/forum/members/4739560.html',
    icon:   'fa-solid fa-code',
    accent: 'c-green',
  },
];


