window.Site = window.Site || {};

(function () {

  function openAsteroids() {
    var r = window.Site.makeFloatWin(
      '<i class="fa-solid fa-meteor" style="margin-right:6px;color:var(--sky)"></i>asteroids',
      760, 610, 'asteroids-window'
    );
    if (!r) return;

    var W = 700;
    var H = 500;

    var running = true;
    var keys = {};
    var lastTime = 0;
    var enemyBullets = [];
    var damageFlash = 0;
    var hitEffects = [];
    var floatingTexts = [];
    var screenShake = 0;
    var critPulse = 0;
    var comboCount = 0;
    var comboTimer = 0;
    var comboMult = 1;
    var styleLabel = 'Calm';
    var fireUnlocked = false;
    var currentBiome = null;
    var pendingDisaster = null;
    var activeDisaster = null;
    var disasterHazards = [];
    var healthPacks = [];

    var state = 'menu';
    var wave = 1;
    var score = 0;
    var lives = 3;
    var fireCooldown = 0;

    var ship = null;
    var bullets = [];
    var enemies = [];
    var activeOverlay = null;

    var upgrades = {
      accel: 0.46,
      maxSpeed: 6.5,
      drag: 0.93,
      turn: 0.08,
      bulletSpeed: 5.6,
      bulletDamage: 1,
      fireMs: 165,
      multiShot: 1,
      pierce: 0,
      critChance: 0,
      critMult: 2,
      autoAim: 0.3,
      bulletCurve: 0.02,
      knockback: 0,
      fireChance: 0,
      fireDamage: 0,
      luck: 0,
      slowPower: 0,
      closeRangeBonus: 0,
      longRangeBonus: 0,
    };

    var BIOMES = [
      {
        id: 'nebula',
        name: 'Crimson Nebula',
        desc: 'Dust fields shorten bullet range and slow enemies.',
        bg: '#1a1024',
        bulletLifeMul: 0.88,
        enemySpeedMul: 0.92,
        shipDragMul: 1.03,
      },
      {
        id: 'ion',
        name: 'Ion Rift',
        desc: 'Volatile currents speed up everyone in combat.',
        bg: '#0b1d2d',
        bulletLifeMul: 1,
        enemySpeedMul: 1.16,
        shipDragMul: 0.98,
      },
      {
        id: 'frost',
        name: 'Frost Belt',
        desc: 'Cold vacuum increases drift and lowers fire pace.',
        bg: '#13283a',
        bulletLifeMul: 1.04,
        enemySpeedMul: 1,
        shipDragMul: 0.95,
      },
      {
        id: 'ember',
        name: 'Ember Expanse',
        desc: 'Thermal pockets boost bullet speed but add recoil drift.',
        bg: '#2a1a11',
        bulletLifeMul: 0.98,
        enemySpeedMul: 1.08,
        shipDragMul: 0.97,
      },
    ];

    var DISASTER_POOL = [
      {
        id: 'solarwind',
        name: 'Solar Wind',
        desc: 'A crosswind pushes everything sideways.',
        color: 'var(--peach)'
      },
      {
        id: 'gravitywell',
        name: 'Gravity Well',
        desc: 'A central pull bends movement toward the middle.',
        color: 'var(--mauve)'
      },
      {
        id: 'meteorstorm',
        name: 'Meteor Storm',
        desc: 'Falling debris cuts through the arena.',
        color: 'var(--red)'
      },
    ];

    var RARITY_STYLES = {
      common: { label: 'COMMON', color: '#9ca3af' },
      uncommon: { label: 'UNCOMMON', color: '#22c55e' },
      rare: { label: 'RARE', color: '#3b82f6' },
      epic: { label: 'EPIC', color: '#a855f7' },
      legendary: { label: 'LEGENDARY', color: '#f59e0b' },
    };

    var RARITY_MULT = {
      common: 1,
      uncommon: 1.2,
      rare: 1.45,
      epic: 1.75,
      legendary: 2.2,
    };

    function rollUpgradeRarity() {
      var luckShift = Math.min(0.2, (upgrades.luck || 0) * 0.2);
      var r = Math.random() - luckShift;
      if (r < 0.45) return 'common';
      if (r < 0.72) return 'uncommon';
      if (r < 0.89) return 'rare';
      if (r < 0.97) return 'epic';
      return 'legendary';
    }

    var UPGRADE_POOL = [
      { id: 'rapid', name: 'Rapid Fire', icon: 'fa-solid fa-gun', desc: '-fire delay', apply: function (mult) { upgrades.fireMs = Math.max(90, upgrades.fireMs - Math.round(12 * mult)); } },
      { id: 'multishot', name: 'Multishot', icon: 'fa-solid fa-braille', desc: '+extra bullets', apply: function (mult) { upgrades.multiShot = Math.min(4, upgrades.multiShot + Math.max(1, Math.floor(mult))); } },
      { id: 'damage', name: 'Heavy Rounds', icon: 'fa-solid fa-burst', desc: '+bullet damage', apply: function (mult) { upgrades.bulletDamage += Math.max(1, Math.round(mult)); } },
      { id: 'thrusters', name: 'Thrusters', icon: 'fa-solid fa-rocket', desc: '+ship speed', apply: function (mult) { upgrades.maxSpeed = Math.min(13.5, upgrades.maxSpeed + 0.25 * mult); } },
      { id: 'armor', name: 'Armor', icon: 'fa-solid fa-shield-halved', desc: '+1 life', apply: function (mult) { lives = Math.min(9, lives + Math.max(1, Math.floor(mult))); updateHud(); } },
      { id: 'pierce', name: 'Piercing Rounds', icon: 'fa-solid fa-bullseye', desc: '+pierce', apply: function (mult) { upgrades.pierce = Math.min(3, upgrades.pierce + Math.max(1, Math.floor(mult))); } },
      { id: 'crit', name: 'Critical Logic', icon: 'fa-solid fa-star', desc: '+crit chance', apply: function (mult) { upgrades.critChance = Math.min(0.6, upgrades.critChance + 0.06 * mult); } },
      { id: 'aimassist', name: 'Aim Assist', icon: 'fa-solid fa-crosshairs', desc: '+auto aim', apply: function (mult) { upgrades.autoAim = Math.min(0.9, upgrades.autoAim + 0.08 * mult); } },
      { id: 'curve', name: 'Mag Curve', icon: 'fa-solid fa-wave-square', desc: '+bullet curve', apply: function (mult) { upgrades.bulletCurve = Math.min(0.35, upgrades.bulletCurve + 0.03 * mult); } },
      { id: 'luck', name: 'Lucky Charm', icon: 'fa-solid fa-clover', desc: '+better rarity odds', apply: function (mult) { upgrades.luck = Math.min(0.5, upgrades.luck + 0.03 * mult); } },
      { id: 'fireunlock', name: 'Inferno Sigil', icon: 'fa-solid fa-crown', desc: 'Unlock fire upgrades', fixedRarity: 'legendary', apply: function () { fireUnlocked = true; upgrades.fireChance = Math.max(upgrades.fireChance, 0.16); upgrades.fireDamage = Math.max(upgrades.fireDamage, 0.45); spawnElementText(ship ? ship.x : W / 2, ship ? ship.y : H / 2, 'FIRE UNLOCKED', '#f59e0b'); } },
      { id: 'firecore', name: 'Fire Core', icon: 'fa-solid fa-fire-flame-curved', desc: '+burn chance', apply: function (mult) { upgrades.fireChance = Math.min(0.9, upgrades.fireChance + 0.08 * mult); upgrades.fireDamage = Math.min(2.4, upgrades.fireDamage + 0.16 * mult); } },
      { id: 'shockwave', name: 'Shockwave Rounds', icon: 'fa-solid fa-arrows-left-right', desc: '+bullet knockback', apply: function (mult) { upgrades.knockback = Math.min(4, upgrades.knockback + 0.4 * mult); } },
      { id: 'closefocus', name: 'Close Focus', icon: 'fa-solid fa-crosshairs', desc: '+close range damage', apply: function (mult) { upgrades.closeRangeBonus = Math.min(2.2, upgrades.closeRangeBonus + 0.15 * mult); } },
      { id: 'longfocus', name: 'Long Focus', icon: 'fa-solid fa-bullseye', desc: '+long range damage', apply: function (mult) { upgrades.longRangeBonus = Math.min(2.2, upgrades.longRangeBonus + 0.15 * mult); } },
    ];

    r.body.innerHTML = '';
    r.body.style.cssText = 'padding:8px;display:flex;flex-direction:column;gap:8px;background:var(--base);overflow:hidden;position:relative;';

    var top = document.createElement('div');
    top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:12px;font-family:"JetBrains Mono",monospace;font-size:12px;color:var(--text);';
    top.innerHTML =
      '<span id="ast-wave">Wave: 0</span>' +
      '<span id="ast-biome">Biome: -</span>' +
      '<span id="ast-score">Score: 0</span>' +
      '<span id="ast-combo">Combo: x1.0 Calm</span>' +
      '<span id="ast-lives">Lives: 0</span>';
    r.body.appendChild(top);

    var controls = document.createElement('div');
    controls.style.cssText = 'font-family:"JetBrains Mono",monospace;font-size:11px;color:var(--subtext0);';
    controls.textContent = 'Controls: WASD move | Auto-aim enabled | Hold Space shoot';
    r.body.appendChild(controls);

    var status = document.createElement('div');
    status.style.cssText = 'min-height:16px;font-family:"JetBrains Mono",monospace;font-size:11px;color:var(--subtext0);';
    r.body.appendChild(status);

    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.cssText = 'display:block;border-radius:8px;background:#0d1323;';
    r.body.appendChild(canvas);

    var waveEl = top.querySelector('#ast-wave');
    var biomeEl = top.querySelector('#ast-biome');
    var scoreEl = top.querySelector('#ast-score');
    var comboEl = top.querySelector('#ast-combo');
    var livesEl = top.querySelector('#ast-lives');

    function setStatus(msg, color) {
      status.textContent = msg || '';
      status.style.color = color || 'var(--subtext0)';
    }

    function updateHud() {
      if (!currentBiome) currentBiome = getBiomeForWave(wave);
      waveEl.textContent = 'Wave: ' + wave;
      biomeEl.textContent = 'Biome: ' + currentBiome.name;
      scoreEl.textContent = 'Score: ' + score;
      comboEl.textContent = 'Combo: x' + comboMult.toFixed(1) + ' ' + styleLabel;
      livesEl.textContent = 'Lives: ' + lives;
    }

    function isBossWave(n) {
      return n % 4 === 0;
    }

    function getBiomeForWave(n) {
      var idx = Math.floor((n - 1) / 4) % BIOMES.length;
      return BIOMES[idx];
    }

    function styleForCombo(combo) {
      if (combo >= 26) return 'Mythic';
      if (combo >= 18) return 'Savage';
      if (combo >= 12) return 'Wild';
      if (combo >= 7) return 'Hot';
      if (combo >= 3) return 'Flow';
      return 'Calm';
    }

    function rollDisasterForWave(nextWave) {
      if (Math.random() < 0.28) return null;
      var pool = DISASTER_POOL.filter(function (d) {
        if (d.id === 'meteorstorm') return nextWave > 10;
        return true;
      });
      if (!pool.length) return null;
      var pick = pool[Math.floor(Math.random() * pool.length)];
      return {
        id: pick.id,
        name: pick.name,
        desc: pick.desc,
        color: pick.color,
        timer: 0,
        spawnTimer: 500,
      };
    }

    function previewTextForUpgrade(upg, mult) {
      mult = mult || 1;
      if (upg.id === 'rapid') return 'ROF ' + Math.round(1000 / upgrades.fireMs) + ' -> ' + Math.round(1000 / Math.max(90, upgrades.fireMs - Math.round(12 * mult)));
      if (upg.id === 'multishot') return 'Shots ' + upgrades.multiShot + ' -> ' + Math.min(4, upgrades.multiShot + Math.max(1, Math.floor(mult)));
      if (upg.id === 'damage') return 'DMG ' + upgrades.bulletDamage + ' -> ' + (upgrades.bulletDamage + Math.max(1, Math.round(mult)));
      if (upg.id === 'thrusters') return 'SPD ' + upgrades.maxSpeed.toFixed(1) + ' -> ' + (upgrades.maxSpeed + 0.25 * mult).toFixed(1);
      if (upg.id === 'armor') return 'Lives ' + lives + ' -> ' + (lives + Math.max(1, Math.floor(mult)));
      if (upg.id === 'pierce') return 'Pierce ' + upgrades.pierce + ' -> ' + Math.min(3, upgrades.pierce + Math.max(1, Math.floor(mult)));
      if (upg.id === 'crit') return 'Crit ' + Math.round(upgrades.critChance * 100) + '% -> ' + Math.round(Math.min(0.6, upgrades.critChance + 0.06 * mult) * 100) + '%';
      if (upg.id === 'aimassist') return 'Aim ' + Math.round(upgrades.autoAim * 100) + ' -> ' + Math.round(Math.min(0.9, upgrades.autoAim + 0.08 * mult) * 100);
      if (upg.id === 'curve') return 'Curve ' + Math.round(upgrades.bulletCurve * 100) + ' -> ' + Math.round(Math.min(0.35, upgrades.bulletCurve + 0.03 * mult) * 100);
      if (upg.id === 'luck') return 'Luck ' + Math.round(upgrades.luck * 100) + '% -> ' + Math.round(Math.min(0.5, upgrades.luck + 0.03 * mult) * 100) + '%';
      if (upg.id === 'fireunlock') return fireUnlocked ? 'Already unlocked' : 'Unlock fire bullets';
      if (upg.id === 'firecore') return 'Burn ' + Math.round(upgrades.fireChance * 100) + '% -> ' + Math.round(Math.min(0.9, upgrades.fireChance + 0.08 * mult) * 100) + '%';
      if (upg.id === 'shockwave') return 'KB ' + upgrades.knockback.toFixed(2) + ' -> ' + Math.min(4, upgrades.knockback + 0.4 * mult).toFixed(2);
      if (upg.id === 'closefocus') return 'Close +' + Math.round(upgrades.closeRangeBonus * 100) + '% -> +' + Math.round(Math.min(2.2, upgrades.closeRangeBonus + 0.15 * mult) * 100) + '%';
      if (upg.id === 'longfocus') return 'Long +' + Math.round(upgrades.longRangeBonus * 100) + '% -> +' + Math.round(Math.min(2.2, upgrades.longRangeBonus + 0.15 * mult) * 100) + '%';
      return '';
    }

    function fireStatusLabel() {
      return fireUnlocked ? 'ON' : 'LOCKED';
    }

    function spawnElementText(x, y, text, color) {
      floatingTexts.push({
        x: x + rand(-7, 7),
        y: y - 10,
        vy: -0.8,
        life: 420,
        maxLife: 420,
        text: text,
        color: color,
        crit: false,
      });
    }

    function resetCombo() {
      comboCount = 0;
      comboTimer = 0;
      comboMult = 1;
      styleLabel = 'Calm';
      updateHud();
    }

    function addKillScore(baseScore, x, y) {
      comboCount += 1;
      comboTimer = 2400;
      comboMult = 1 + Math.min(2.8, comboCount * 0.12);
      styleLabel = styleForCombo(comboCount);

      var gained = Math.round(baseScore * comboMult);
      score += gained;
      floatingTexts.push({
        x: x + rand(-8, 8),
        y: y - 14,
        vy: -0.85,
        life: 520,
        maxLife: 520,
        text: '+' + gained + ' x' + comboMult.toFixed(1),
        color: '#a6e3a1',
        crit: false,
      });
      updateHud();
    }

    function showBetweenWaveEvent() {
      state = 'intermission';
      pendingDisaster = rollDisasterForWave(wave + 1);
      if (!pendingDisaster) {
        showUpgradeMenu();
        return;
      }
      var shortById = {
        meteorstorm: 'Debris rain',
        solarwind: 'Strong crosswind',
        gravitywell: 'Center pull',
      };
      var shortText = shortById[pendingDisaster.id] || pendingDisaster.desc;
      var nextBiome = getBiomeForWave(wave + 1);
      showOverlay(function () {
        var inner = document.createElement('div');
        var eventColor = pendingDisaster.color;
        var eventName = pendingDisaster.name;
        inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:360px;';
        inner.innerHTML =
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:18px;font-weight:700;color:var(--text)">NEXT WAVE</div>' +
          '<div style="border:1px solid ' + eventColor + ';background:rgba(17,17,27,0.65);border-radius:8px;padding:10px;text-align:center">' +
          '<div style="font-family:JetBrains Mono,monospace;font-size:14px;font-weight:700;color:' + eventColor + '">' + eventName + '</div>' +
          '<div style="font-family:JetBrains Mono,monospace;font-size:11px;color:var(--subtext0);margin-top:4px">' + shortText + '</div>' +
          '</div>' +
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:12px;color:var(--text)">Biome: ' + nextBiome.name + '</div>';

        var btn = document.createElement('button');
        btn.className = 'g2048-btn';
        btn.textContent = 'Pick Upgrade';
        btn.addEventListener('click', function () {
          showUpgradeMenu();
        });
        inner.appendChild(btn);
        return inner;
      });
    }

    function updateDisaster(dt, dtMs) {
      if (!activeDisaster) return;

      activeDisaster.timer -= dtMs;
      activeDisaster.spawnTimer -= dtMs;

      if (activeDisaster.id === 'meteorstorm' && activeDisaster.spawnTimer <= 0) {
        activeDisaster.spawnTimer = 220;
        spawnEnemyBullet(rand(0, W), -8, rand(-0.6, 0.6), rand(2.8, 4.1), 4, '#f38ba8', 1);
      } else if (activeDisaster.id === 'solarwind') {
        if (activeDisaster.spawnTimer <= 0) {
          activeDisaster.spawnTimer = 900;
          fireCooldown += 100;
          damageFlash = Math.max(damageFlash, 70);
        }
      } else if (activeDisaster.id === 'gravitywell' && ship) {
        var dx = (W / 2) - ship.x;
        var dy = (H / 2) - ship.y;
        var dd = Math.max(1, Math.hypot(dx, dy));
        ship.vx += (dx / dd) * 0.08 * dt;
        ship.vy += (dy / dd) * 0.08 * dt;
      }

      if (activeDisaster.id === 'solarwind') {
        var wind = Math.sin(performance.now() * 0.0018) * 0.09 * dt;
        if (ship) ship.vx += wind;
        for (var i = 0; i < bullets.length; i++) bullets[i].vx += wind * 0.45;
        for (var j = 0; j < enemyBullets.length; j++) enemyBullets[j].vx += wind * 0.35;
      }

      if (activeDisaster.timer <= 0) {
        activeDisaster = null;
      }
    }

    function updateHealthPacks(dtMs) {
      for (var i = healthPacks.length - 1; i >= 0; i--) {
        var pack = healthPacks[i];
        pack.life -= dtMs;
        if (pack.life <= 0) {
          healthPacks.splice(i, 1);
          continue;
        }

        if (ship && Math.hypot(ship.x - pack.x, ship.y - pack.y) <= pack.r + 10) {
          healthPacks.splice(i, 1);
          lives = Math.min(9, lives + 1);
          updateHud();
          floatingTexts.push({
            x: pack.x,
            y: pack.y - 8,
            vy: -0.8,
            life: 560,
            maxLife: 560,
            text: '+1 HP',
            color: '#22c55e',
            crit: false,
          });
          setStatus('Health pack', 'var(--green)');
        }
      }
    }

    function rand(a, b) {
      return a + Math.random() * (b - a);
    }

    function spawnImpact(x, y, damage, isCrit, color) {
      hitEffects.push({
        x: x,
        y: y,
        life: isCrit ? 260 : 180,
        maxLife: isCrit ? 260 : 180,
        radius: isCrit ? 12 : 8,
        color: color || (isCrit ? '#f9e2af' : '#89dceb'),
        crit: isCrit,
      });
      floatingTexts.push({
        x: x + rand(-8, 8),
        y: y - 8,
        vy: isCrit ? -1.45 : -1.1,
        life: isCrit ? 560 : 420,
        maxLife: isCrit ? 560 : 420,
        text: (isCrit ? 'CRIT ' : '-') + damage,
        color: isCrit ? '#f9e2af' : '#cdd6f4',
        crit: isCrit,
      });
      screenShake = Math.min(12, screenShake + (isCrit ? 4.5 : 1.8));
      if (isCrit) critPulse = 320;
    }

    function updateFeedback(dt, dtMs) {
      if (screenShake > 0) screenShake = Math.max(0, screenShake - 0.45 * dt);
      if (critPulse > 0) critPulse = Math.max(0, critPulse - dtMs);
      if (comboTimer > 0) {
        comboTimer -= dtMs;
        if (comboTimer <= 0) {
          resetCombo();
        }
      }

      for (var i = hitEffects.length - 1; i >= 0; i--) {
        var effect = hitEffects[i];
        effect.life -= dtMs;
        effect.radius += (effect.crit ? 0.65 : 0.4) * dt;
        if (effect.life <= 0) hitEffects.splice(i, 1);
      }

      for (var j = floatingTexts.length - 1; j >= 0; j--) {
        var text = floatingTexts[j];
        text.life -= dtMs;
        text.y += text.vy * dt;
        if (text.crit) text.x += Math.sin((text.maxLife - text.life) * 0.03) * 0.35 * dt;
        if (text.life <= 0) floatingTexts.splice(j, 1);
      }

      for (var k = 0; k < enemies.length; k++) {
        if (enemies[k].hitFlash > 0) enemies[k].hitFlash = Math.max(0, enemies[k].hitFlash - dtMs);
      }
    }

    function wrap(o) {
      if (o.x < 0) o.x += W;
      if (o.x >= W) o.x -= W;
      if (o.y < 0) o.y += H;
      if (o.y >= H) o.y -= H;
    }

    function clearOverlay() {
      if (activeOverlay && activeOverlay.parentNode) {
        activeOverlay.parentNode.removeChild(activeOverlay);
      }
      activeOverlay = null;
    }

    function showOverlay(contentBuilder) {
      clearOverlay();
      var ov = document.createElement('div');
      ov.style.cssText = 'position:absolute;inset:74px 8px 8px 8px;background:rgba(17,17,27,0.74);border-radius:8px;display:flex;align-items:center;justify-content:center;z-index:3;';
      var inner = contentBuilder();
      ov.appendChild(inner);
      r.body.appendChild(ov);
      activeOverlay = ov;
    }

    function makeShip() {
      return {
        x: W / 2,
        y: H / 2,
        vx: 0,
        vy: 0,
        a: -Math.PI / 2,
        invuln: 1200,
      };
    }

    function getSpawnPoint(fromX, fromY, safeRadius) {
      if (typeof fromX === 'number' && typeof fromY === 'number') {
        return { x: fromX, y: fromY };
      }

      var radius = safeRadius || 140;
      var centerX = W / 2;
      var centerY = H / 2;
      var x = rand(0, W);
      var y = rand(0, H);
      var tries = 0;
      while (tries < 40 && Math.hypot(x - centerX, y - centerY) < radius) {
        x = rand(0, W);
        y = rand(0, H);
        tries++;
      }
      return { x: x, y: y };
    }

    function nearestEnemy() {
      if (!enemies.length || !ship) return null;
      var best = null;
      var bestDist = Infinity;
      for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];
        var dist = Math.hypot(enemy.x - ship.x, enemy.y - ship.y);
        if (dist < bestDist) {
          best = enemy;
          bestDist = dist;
        }
      }
      return best;
    }

    function lerpAngle(from, to, t) {
      var delta = ((to - from + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      return from + delta * t;
    }

    function scaledEnemyHp(baseHp) {
      var waveScale = 1 + Math.max(0, wave - 1) * 0.045;
      return Math.max(1, Math.round(baseHp * waveScale));
    }

    function spawnAsteroid(sizeTier, fromX, fromY) {
      var rByTier = [14, 24, 36];
      var hpByTier = [1, 2, 4];
      var speedScale = (1 + Math.min(1.25, wave * 0.06)) * (currentBiome ? currentBiome.enemySpeedMul : 1);
      var tier = Math.max(0, Math.min(2, sizeTier));
      var point = getSpawnPoint(fromX, fromY, 150);
      var x = point.x;
      var y = point.y;

      if (typeof fromX !== 'number') {
        var tries = 0;
        while (tries < 22 && ship && Math.hypot(x - ship.x, y - ship.y) < 120) {
          point = getSpawnPoint(null, null, 150);
          x = point.x;
          y = point.y;
          tries++;
        }
      }

      enemies.push({
        type: 'asteroid',
        x: x,
        y: y,
        vx: rand(-1.8, 1.8) * speedScale,
        vy: rand(-1.8, 1.8) * speedScale,
        r: rByTier[tier],
        hp: scaledEnemyHp(hpByTier[tier] + Math.floor(wave / 4)),
        maxHp: scaledEnemyHp(hpByTier[tier] + Math.floor(wave / 4)),
        tier: tier,
        spin: rand(-0.03, 0.03),
      });
    }

    function spawnHunter(fromX, fromY) {
      var point = getSpawnPoint(fromX, fromY, 150);
      var x = point.x;
      var y = point.y;
      enemies.push({
        type: 'hunter',
        x: x,
        y: y,
        vx: rand(-0.5, 0.5),
        vy: rand(-0.5, 0.5),
        r: 16 + Math.min(10, Math.floor(wave / 3)),
        hp: scaledEnemyHp(2 + Math.floor(wave / 5)),
        maxHp: scaledEnemyHp(2 + Math.floor(wave / 5)),
        maxSpeed: (1.8 + Math.min(2.4, wave * 0.08)) * (currentBiome ? currentBiome.enemySpeedMul : 1),
        seek: (0.028 + Math.min(0.03, wave * 0.0018)) * (currentBiome ? currentBiome.enemySpeedMul : 1),
      });
    }

    function spawnBomber(fromX, fromY) {
      var point = getSpawnPoint(fromX, fromY, 150);
      var x = point.x;
      var y = point.y;
      enemies.push({
        type: 'bomber',
        x: x,
        y: y,
        vx: rand(-0.8, 0.8),
        vy: rand(-0.8, 0.8),
        r: 18,
        hp: scaledEnemyHp(4 + Math.floor(wave / 4)),
        maxHp: scaledEnemyHp(4 + Math.floor(wave / 4)),
        bombTimer: Math.round(1200 / (currentBiome ? currentBiome.enemySpeedMul : 1)),
      });
    }

    function spawnShooter(fromX, fromY) {
      var point = getSpawnPoint(fromX, fromY, 150);
      var x = point.x;
      var y = point.y;
      enemies.push({
        type: 'shooter',
        x: x,
        y: y,
        vx: rand(-0.6, 0.6),
        vy: rand(-0.6, 0.6),
        r: 16,
        hp: scaledEnemyHp(3 + Math.floor(wave / 4)),
        maxHp: scaledEnemyHp(3 + Math.floor(wave / 4)),
        fireTimer: Math.round(900 / (currentBiome ? currentBiome.enemySpeedMul : 1)),
        desired: 180,
      });
    }

    function spawnSonic(fromX, fromY) {
      var point = getSpawnPoint(fromX, fromY, 150);
      var x = point.x;
      var y = point.y;
      enemies.push({
        type: 'sonic',
        x: x,
        y: y,
        vx: rand(-0.3, 0.3),
        vy: rand(-0.3, 0.3),
        r: 13,
        hp: scaledEnemyHp(2 + Math.floor(wave / 6)),
        maxHp: scaledEnemyHp(2 + Math.floor(wave / 6)),
        maxSpeed: (3.2 + Math.min(3, wave * 0.11)) * (currentBiome ? currentBiome.enemySpeedMul : 1),
        dashTimer: 900,
      });
    }

    function spawnTank(fromX, fromY) {
      var point = getSpawnPoint(fromX, fromY, 150);
      var x = point.x;
      var y = point.y;
      enemies.push({
        type: 'tank',
        x: x,
        y: y,
        vx: rand(-0.25, 0.25),
        vy: rand(-0.25, 0.25),
        r: 24,
        hp: scaledEnemyHp(8 + Math.floor(wave / 2)),
        maxHp: scaledEnemyHp(8 + Math.floor(wave / 2)),
        armor: 1,
      });
    }

    function spawnWaveEnemies() {
      var total = wave < 5 ? (2 + wave) : Math.min(13, 6 + Math.floor(wave * 0.8));
      var shooterCap = wave < 5 ? 1 : Math.min(3, 1 + Math.floor((wave - 5) / 3));
      var bomberCap = wave < 5 ? (wave >= 4 ? 1 : 0) : Math.min(2, 1 + Math.floor((wave - 6) / 5));
      var sonicCap = wave >= 7 ? Math.min(2, 1 + Math.floor((wave - 7) / 6)) : 0;
      var tankCap = wave >= 10 ? 1 : 0;

      var shooterCount = 0;
      var bomberCount = 0;
      var sonicCount = 0;
      var tankCount = 0;

      for (var i = 0; i < total; i++) {
        var roll = Math.random();

        if (wave < 5) {
          if (shooterCount < shooterCap && roll < 0.2) {
            spawnShooter();
            shooterCount++;
          } else if (wave >= 4 && bomberCount < bomberCap && roll < 0.34) {
            spawnBomber();
            bomberCount++;
          } else if (wave >= 3 && roll < 0.56) {
            spawnHunter();
          } else {
            var earlyTier = wave >= 4 ? (Math.random() < 0.35 ? 1 : 0) : 0;
            spawnAsteroid(earlyTier);
          }
          continue;
        }

        if (tankCap > 0 && tankCount < tankCap && roll < 0.07) {
          spawnTank();
          tankCount++;
        } else if (sonicCap > 0 && sonicCount < sonicCap && roll < 0.16) {
          spawnSonic();
          sonicCount++;
        } else if (shooterCount < shooterCap && roll < 0.3) {
          spawnShooter();
          shooterCount++;
        } else if (bomberCount < bomberCap && roll < 0.44) {
          spawnBomber();
          bomberCount++;
        } else if (roll < 0.66) {
          spawnHunter();
        } else {
          var tier = Math.random() < Math.min(0.3, 0.08 + wave * 0.015) ? 2 : (Math.random() < 0.42 ? 1 : 0);
          spawnAsteroid(tier);
        }
      }

      if (wave < 5 && shooterCount < 1) {
        spawnShooter();
      }
    }

    function spawnEnemyBullet(x, y, vx, vy, radius, color, damage) {
      var bulletMul = currentBiome ? Math.max(0.8, (1 + (currentBiome.enemySpeedMul - 1) * 0.85)) : 1;
      enemyBullets.push({
        x: x,
        y: y,
        vx: vx * bulletMul,
        vy: vy * bulletMul,
        r: radius,
        color: color,
        damage: damage,
        life: 2200,
      });
    }

    function spawnBoss() {
      enemies.push({
        type: 'boss',
        x: W / 2,
        y: 86,
        vx: rand(-1.1, 1.1) * (1 + wave * 0.03) * (currentBiome ? currentBiome.enemySpeedMul : 1),
        vy: rand(0.4, 1.1) * (1 + wave * 0.03) * (currentBiome ? currentBiome.enemySpeedMul : 1),
        r: 58,
        hp: scaledEnemyHp(28 + wave * 4),
        maxHp: scaledEnemyHp(28 + wave * 4),
        spin: 0,
        summonTimer: 2200,
      });

      for (var i = 0; i < 4; i++) spawnAsteroid(1);
      setStatus('Boss wave in ' + currentBiome.name + '. ' + currentBiome.desc, 'var(--peach)');
    }

    function startWave() {
      clearOverlay();
      currentBiome = getBiomeForWave(wave);
      activeDisaster = pendingDisaster;
      pendingDisaster = null;
      if (activeDisaster) {
        activeDisaster.timer = 22000;
        activeDisaster.spawnTimer = 220;
        if (activeDisaster.id === 'meteorstorm') {
          lives = Math.min(9, lives + 1);
          setStatus('Meteor Storm prep bonus: +1 life', 'var(--green)');
        }
      }
      bullets = [];
      enemyBullets = [];
      enemies = [];
      healthPacks = [];
      hitEffects = [];
      floatingTexts = [];
      screenShake = 0;
      critPulse = 0;
      fireCooldown = 0;
      ship.invuln = 900;

      if (isBossWave(wave)) {
        spawnBoss();
      } else {
        spawnWaveEnemies();
        if (activeDisaster) {
          setStatus('Wave ' + wave + ' | ' + currentBiome.name + ' | ' + activeDisaster.name + ' - ' + activeDisaster.desc, activeDisaster.color);
        } else {
          setStatus('Wave ' + wave + ' in ' + currentBiome.name + ' - ' + currentBiome.desc, 'var(--blue)');
        }
      }

      state = 'playing';
      updateHud();
    }

    function startRun() {
      wave = 1;
      score = 0;
      lives = 3;
      fireUnlocked = false;
      ship = makeShip();
      bullets = [];
      enemyBullets = [];
      enemies = [];
      healthPacks = [];
      hitEffects = [];
      floatingTexts = [];
      screenShake = 0;
      critPulse = 0;
      comboCount = 0;
      comboTimer = 0;
      comboMult = 1;
      styleLabel = 'Calm';
      pendingDisaster = null;
      activeDisaster = null;
      currentBiome = getBiomeForWave(1);
      upgrades = {
        accel: 0.46,
        maxSpeed: 6.5,
        drag: 0.93,
        turn: 0.08,
        bulletSpeed: 5.6,
        bulletDamage: 1,
        fireMs: 165,
        multiShot: 1,
        pierce: 0,
        critChance: 0,
        critMult: 2,
        autoAim: 0.3,
        bulletCurve: 0.02,
        knockback: 0,
        fireChance: 0,
        fireDamage: 0,
        luck: 0,
        slowPower: 0,
        closeRangeBonus: 0,
        longRangeBonus: 0,
      };
      controls.textContent = 'Controls: WASD move | Auto-aim enabled | Hold Space shoot';
      updateHud();
      startWave();
    }

    function randomChoices(pool, n) {
      var copy = pool.slice();
      var out = [];
      while (copy.length && out.length < n) {
        var i = Math.floor(Math.random() * copy.length);
        out.push(copy.splice(i, 1)[0]);
      }
      return out;
    }

    function availableUpgrades() {
      return UPGRADE_POOL.filter(function (u) {
        if (u.id === 'firecore' && !fireUnlocked) return false;
        if (u.id === 'fireunlock' && fireUnlocked) return false;
        return true;
      });
    }

    function showUpgradeMenu() {
      state = 'upgrade';
      var picks = randomChoices(availableUpgrades(), 3).map(function (p) {
        var rarity = p.fixedRarity || rollUpgradeRarity();
        var mult = RARITY_MULT[rarity] || 1;
        return {
          base: p,
          rarity: rarity,
          mult: mult,
        };
      });
      showOverlay(function () {
        var inner = document.createElement('div');
        inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:420px;';
        inner.innerHTML =
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:20px;font-weight:700;color:var(--text)">Upgrade Pick</div>' +
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--subtext0)">Wave ' + wave + ' cleared. Choose one:</div>' +
          (pendingDisaster ? '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:11px;color:' + pendingDisaster.color + '">Next Event: ' + pendingDisaster.name + '</div>' : '');

        var row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:10px;';
        picks.forEach(function (p) {
          var preview = previewTextForUpgrade(p.base, p.mult);
          var rarity = RARITY_STYLES[p.rarity] || RARITY_STYLES.common;
          var b = document.createElement('button');
          b.style.cssText = 'flex:1;border:1px solid ' + rarity.color + ';border-radius:8px;padding:10px;background:var(--surface1);color:var(--text);cursor:pointer;text-align:left;font-family:"JetBrains Mono",monospace;';
          b.innerHTML = '<div style="text-align:center;font-size:10px;font-weight:700;letter-spacing:0.06em;color:' + rarity.color + ';margin-bottom:8px">' + rarity.label + '</div><div style="text-align:center;font-size:22px;margin-bottom:8px"><i class="' + p.base.icon + '"></i></div><div style="font-weight:700;margin-bottom:6px;text-align:center">' + p.base.name + '</div><div style="font-size:11px;color:var(--subtext0);text-align:center">' + p.base.desc + '</div><div style="font-size:11px;color:var(--green);text-align:center;margin-top:6px">' + preview + '</div>';
          b.addEventListener('click', function () {
            p.base.apply(p.mult);
            wave++;
            startWave();
          });
          row.appendChild(b);
        });
        inner.appendChild(row);
        return inner;
      });
    }

    function showMainMenu() {
      state = 'menu';
      setStatus('Start a new run', 'var(--subtext0)');
      showOverlay(function () {
        var inner = document.createElement('div');
        inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:310px;';
        inner.innerHTML =
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:22px;font-weight:700;color:var(--text)">ASTEROIDS ROGUE</div>' +
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:11px;color:var(--subtext0)">Biomes last 3 waves, then wave 4 is a boss. Disasters strike between waves.</div>' +
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:10px;color:var(--overlay0)">Biomes: Crimson Nebula, Ion Rift, Frost Belt, Ember Expanse</div>';

        var startBtn = document.createElement('button');
        startBtn.className = 'g2048-btn';
        startBtn.textContent = 'Start Run';
        startBtn.addEventListener('click', function () {
          clearOverlay();
          startRun();
        });
        inner.appendChild(startBtn);
        return inner;
      });
    }

    function showGameOver() {
      state = 'gameover';
      setStatus('Run ended. Press Enter to restart.', 'var(--red)');
      showOverlay(function () {
        var inner = document.createElement('div');
        inner.style.cssText = 'display:flex;flex-direction:column;gap:10px;min-width:300px;';
        inner.innerHTML =
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:28px;font-weight:700;color:var(--red)">Game Over</div>' +
          '<div style="text-align:center;font-family:JetBrains Mono,monospace;font-size:12px;color:var(--text)">Score: ' + score + ' | Wave: ' + wave + '</div>';

        var btn = document.createElement('button');
        btn.className = 'g2048-btn';
        btn.textContent = 'New Run';
        btn.addEventListener('click', function () {
          clearOverlay();
          startRun();
        });
        inner.appendChild(btn);
        return inner;
      });
    }

    function shoot() {
      if (state !== 'playing') return;
      var spread = 0.16;
      var count = upgrades.multiShot;
      var center = (count - 1) / 2;
      for (var i = 0; i < count; i++) {
        var a = ship.a + (i - center) * spread;
        bullets.push({
          x: ship.x + Math.cos(a) * 16,
          y: ship.y + Math.sin(a) * 16,
          vx: ship.vx + Math.cos(a) * upgrades.bulletSpeed,
          vy: ship.vy + Math.sin(a) * upgrades.bulletSpeed,
          life: 980,
          damage: upgrades.bulletDamage,
          pierce: upgrades.pierce,
          knockback: upgrades.knockback,
          fireChance: upgrades.fireChance,
          fireDamage: upgrades.fireDamage,
          slowPower: upgrades.slowPower,
          spawnX: ship.x,
          spawnY: ship.y,
        });
      }
    }

    function destroyEnemy(e) {
      var baseScore = 0;
      if (e.type === 'asteroid') {
        baseScore = 12 + e.tier * 8;
        if (e.tier > 0) {
          spawnAsteroid(e.tier - 1, e.x + rand(-4, 4), e.y + rand(-4, 4));
          spawnAsteroid(e.tier - 1, e.x + rand(-4, 4), e.y + rand(-4, 4));
        }
      } else if (e.type === 'hunter') {
        baseScore = 28 + wave * 2;
      } else if (e.type === 'bomber') {
        baseScore = 36 + wave * 3;
        for (var bi = 0; bi < 8; bi++) {
          var bang = (Math.PI * 2 * bi) / 8;
          spawnEnemyBullet(e.x, e.y, Math.cos(bang) * 2.6, Math.sin(bang) * 2.6, 4, '#fab387', 1);
        }
      } else if (e.type === 'shooter') {
        baseScore = 34 + wave * 3;
      } else if (e.type === 'sonic') {
        baseScore = 42 + wave * 4;
      } else if (e.type === 'tank') {
        baseScore = 60 + wave * 6;
      } else {
        baseScore = 220 + wave * 20;
        setStatus('Boss down. Choose your upgrade.', 'var(--green)');
      }

      if (lives <= 2 && Math.random() < rand(0.03, 0.05)) {
        healthPacks.push({
          x: e.x,
          y: e.y,
          r: 8,
          life: 8000,
        });
      }

      addKillScore(baseScore, e.x, e.y);
    }

    function updateShip(dt, dtMs) {
      if (!ship) return;

      var aimTarget = nearestEnemy();
      if (aimTarget) {
        var targetAngle = Math.atan2(aimTarget.y - ship.y, aimTarget.x - ship.x);
        ship.a = lerpAngle(ship.a, targetAngle, Math.min(1, upgrades.autoAim * dt));
      }

      var ax = 0;
      var ay = 0;
      var accelMul = currentBiome ? currentBiome.enemySpeedMul / Math.max(0.86, currentBiome.enemySpeedMul) : 1;
      if (keys.w || keys.W) ay -= upgrades.accel * accelMul;
      if (keys.s || keys.S) ay += upgrades.accel * accelMul;
      if (keys.a || keys.A) ax -= upgrades.accel * accelMul;
      if (keys.d || keys.D) ax += upgrades.accel * accelMul;

      ship.vx += ax * dt;
      ship.vy += ay * dt;

      var speed = Math.hypot(ship.vx, ship.vy);
      if (speed > upgrades.maxSpeed) {
        var ratio = upgrades.maxSpeed / speed;
        ship.vx *= ratio;
        ship.vy *= ratio;
      }

      var biomeDrag = currentBiome ? currentBiome.shipDragMul : 1;
      ship.vx *= Math.pow(upgrades.drag * biomeDrag, dt);
      ship.vy *= Math.pow(upgrades.drag * biomeDrag, dt);

      ship.x += ship.vx * dt;
      ship.y += ship.vy * dt;
      wrap(ship);

      if (ship.invuln > 0) ship.invuln -= dtMs;
      if (damageFlash > 0) damageFlash -= dtMs;

      fireCooldown -= dtMs;
      if ((keys[' '] || keys.Spacebar) && fireCooldown <= 0) {
        shoot();
        fireCooldown = upgrades.fireMs;
      }
    }

    function updateBullets(dt, dtMs) {
      for (var i = bullets.length - 1; i >= 0; i--) {
        var b = bullets[i];
        var bulletTarget = null;
        var nearestDist = Infinity;
        for (var ti = 0; ti < enemies.length; ti++) {
          var target = enemies[ti];
          var targetDist = Math.hypot(target.x - b.x, target.y - b.y);
          if (targetDist < nearestDist) {
            nearestDist = targetDist;
            bulletTarget = target;
          }
        }

        if (bulletTarget && upgrades.bulletCurve > 0) {
          var speed = Math.max(0.001, Math.hypot(b.vx, b.vy));
          var currentAngle = Math.atan2(b.vy, b.vx);
          var wantedAngle = Math.atan2(bulletTarget.y - b.y, bulletTarget.x - b.x);
          var nextAngle = lerpAngle(currentAngle, wantedAngle, Math.min(1, upgrades.bulletCurve * dt));
          b.vx = Math.cos(nextAngle) * speed;
          b.vy = Math.sin(nextAngle) * speed;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dtMs / (currentBiome ? currentBiome.bulletLifeMul : 1);
        if (b.life <= 0 || b.x < -8 || b.x > W + 8 || b.y < -8 || b.y > H + 8) bullets.splice(i, 1);
      }

      for (var j = enemyBullets.length - 1; j >= 0; j--) {
        var eb = enemyBullets[j];
        eb.x += eb.vx * dt;
        eb.y += eb.vy * dt;
        eb.life -= dtMs;
        if (eb.life <= 0 || eb.x < -12 || eb.x > W + 12 || eb.y < -12 || eb.y > H + 12) {
          enemyBullets.splice(j, 1);
        }
      }
    }

    function updateEnemies(dt, dtMs) {
      for (var i = enemies.length - 1; i >= 0; i--) {
        var e = enemies[i];
        var slowMul = 1;
        if (e.slowMs && e.slowMs > 0) {
          e.slowMs -= dtMs;
          slowMul = Math.max(0.45, 1 - (e.slowPower || 0));
          if (e.slowMs <= 0) {
            e.slowMs = 0;
            e.slowPower = 0;
          }
        }

        if (e.burnMs && e.burnMs > 0) {
          e.burnMs -= dtMs;
          e.burnTick = (e.burnTick || 780) - dtMs;
          e.fireStacks = Math.max(0, (e.fireStacks || 0) - dtMs * 0.00018);
          if (e.burnTick <= 0) {
            var stacks = e.fireStacks || 0;
            e.burnTick = Math.max(520, 820 - stacks * 28);
            var burnDamage = Math.min(0.22, 0.03 + stacks * 0.05);
            e.hp -= burnDamage;
            e.hitFlash = Math.max(e.hitFlash || 0, 60);
            spawnImpact(e.x, e.y, burnDamage.toFixed(1), false, '#f97316');
            if (e.hp <= 0) {
              enemies.splice(i, 1);
              destroyEnemy(e);
              continue;
            }
          }

          if (e.burnMs <= 0 && (e.fireStacks || 0) <= 0.05) {
            e.burnMs = 0;
            e.fireStacks = 0;
          }
        }

        if (e.type === 'boss') {
          var toShipX = ship.x - e.x;
          var toShipY = ship.y - e.y;
          var dist = Math.max(1, Math.hypot(toShipX, toShipY));
          e.vx += (toShipX / dist) * 0.018 * slowMul * dt;
          e.vy += (toShipY / dist) * 0.018 * slowMul * dt;
          var bs = Math.hypot(e.vx, e.vy);
          var bCap = 2.6 * slowMul;
          if (bs > bCap) {
            e.vx *= bCap / bs;
            e.vy *= bCap / bs;
          }

          e.summonTimer -= dtMs;
          if (e.summonTimer <= 0) {
            e.summonTimer = 2000;
            if (Math.random() < 0.4) spawnHunter(e.x + rand(-20, 20), e.y + rand(-20, 20));
            else spawnAsteroid(Math.random() < 0.5 ? 0 : 1, e.x + rand(-20, 20), e.y + rand(-20, 20));
          }
        } else if (e.type === 'hunter') {
          var hx = ship.x - e.x;
          var hy = ship.y - e.y;
          var hdist = Math.max(1, Math.hypot(hx, hy));
          e.vx += (hx / hdist) * e.seek * slowMul * dt;
          e.vy += (hy / hdist) * e.seek * slowMul * dt;
          var hs = Math.hypot(e.vx, e.vy);
          var hCap = e.maxSpeed * slowMul;
          if (hs > hCap) {
            e.vx *= hCap / hs;
            e.vy *= hCap / hs;
          }
        } else if (e.type === 'bomber') {
          e.bombTimer -= dtMs;
          if (e.bombTimer <= 0) {
            e.bombTimer = 1300;
            var bx = ship.x - e.x;
            var by = ship.y - e.y;
            var bdist = Math.max(1, Math.hypot(bx, by));
            spawnEnemyBullet(e.x, e.y, (bx / bdist) * 2.2, (by / bdist) * 2.2, 6, '#fab387', 1);
          }
        } else if (e.type === 'shooter') {
          var sx = ship.x - e.x;
          var sy = ship.y - e.y;
          var sdist = Math.max(1, Math.hypot(sx, sy));
          if (sdist < e.desired - 20) {
            e.vx -= (sx / sdist) * 0.03 * slowMul * dt;
            e.vy -= (sy / sdist) * 0.03 * slowMul * dt;
          } else if (sdist > e.desired + 20) {
            e.vx += (sx / sdist) * 0.02 * slowMul * dt;
            e.vy += (sy / sdist) * 0.02 * slowMul * dt;
          }
          e.fireTimer -= dtMs;
          if (e.fireTimer <= 0) {
            e.fireTimer = Math.max(540, 1100 - wave * 24);
            spawnEnemyBullet(e.x, e.y, (sx / sdist) * 3.2, (sy / sdist) * 3.2, 4, '#89b4fa', 1);
          }
        } else if (e.type === 'sonic') {
          e.dashTimer -= dtMs;
          if (e.dashTimer <= 0) {
            e.dashTimer = 900;
            var dx = ship.x - e.x;
            var dy = ship.y - e.y;
            var dd = Math.max(1, Math.hypot(dx, dy));
            e.vx += (dx / dd) * 3.4 * slowMul;
            e.vy += (dy / dd) * 3.4 * slowMul;
          }
          var ss = Math.hypot(e.vx, e.vy);
          var sCap = e.maxSpeed * slowMul;
          if (ss > sCap) {
            e.vx *= sCap / ss;
            e.vy *= sCap / ss;
          }
        } else if (e.type === 'tank') {
          var tx = ship.x - e.x;
          var ty = ship.y - e.y;
          var tdist = Math.max(1, Math.hypot(tx, ty));
          e.vx += (tx / tdist) * 0.012 * slowMul * dt;
          e.vy += (ty / tdist) * 0.012 * slowMul * dt;
          var ts = Math.hypot(e.vx, e.vy);
          var tCap = 1.2 * slowMul;
          if (ts > tCap) {
            e.vx *= tCap / ts;
            e.vy *= tCap / ts;
          }
        }

        e.x += e.vx * dt;
        e.y += e.vy * dt;
        wrap(e);
      }
    }

    function doCollisions() {
      var i;
      var j;

      for (i = bullets.length - 1; i >= 0; i--) {
        var b = bullets[i];
        var removed = false;
        for (j = enemies.length - 1; j >= 0; j--) {
          var e = enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) <= e.r + 1) {
            var damage = b.damage;
            var traveled = Math.hypot(b.x - (b.spawnX || b.x), b.y - (b.spawnY || b.y));
            if (traveled <= 130 && upgrades.closeRangeBonus > 0) {
              damage *= (1 + upgrades.closeRangeBonus);
            }
            if (traveled >= 310 && upgrades.longRangeBonus > 0) {
              damage *= (1 + upgrades.longRangeBonus);
            }
            var isCrit = false;
            if (Math.random() < upgrades.critChance) {
              damage *= upgrades.critMult;
              isCrit = true;
            }
            if (e.armor) damage = Math.max(1, damage - e.armor);
            e.hp -= damage;
            e.hitFlash = isCrit ? 160 : 90;
            spawnImpact(b.x, b.y, damage, isCrit, isCrit ? '#f9e2af' : '#89dceb');

            if (b.knockback > 0) {
              var kdist = Math.max(0.001, Math.hypot(b.vx, b.vy));
              e.vx += (b.vx / kdist) * b.knockback;
              e.vy += (b.vy / kdist) * b.knockback;
            }
            if (b.fireDamage > 0) {
              var fireGain = Math.max(0.12, b.fireDamage * 0.35 + b.fireChance * 0.16);
              e.fireStacks = Math.min(8, (e.fireStacks || 0) + fireGain);
              e.burnMs = Math.max(e.burnMs || 0, 2600 + e.fireStacks * 220);
              if (!e.burnTick || e.burnTick < 420) e.burnTick = 780;
              spawnElementText(e.x, e.y, 'BURN x' + e.fireStacks.toFixed(1), '#f97316');
            }
            if (b.slowPower > 0) {
              e.slowMs = Math.max(e.slowMs || 0, 1400);
              e.slowPower = Math.max(e.slowPower || 0, b.slowPower);
              spawnElementText(e.x, e.y, 'SLOW', '#22c55e');
            }

            if (isCrit) {
              setStatus('Critical hit!', 'var(--yellow)');
            }

            if (e.hp <= 0) {
              enemies.splice(j, 1);
              destroyEnemy(e);
            }

            if (b.pierce > 0) {
              b.pierce--;
            } else {
              bullets.splice(i, 1);
              removed = true;
              break;
            }
          }
        }
        if (removed) continue;
      }

      if (ship.invuln <= 0) {
        for (i = 0; i < enemies.length; i++) {
          var hit = enemies[i];
          if (Math.hypot(ship.x - hit.x, ship.y - hit.y) <= hit.r + 12) {
            lives--;
            updateHud();
            resetCombo();
            ship.invuln = 1400;
            ship.vx *= -0.45;
            ship.vy *= -0.45;
            damageFlash = 220;
            setStatus('Hull hit!', 'var(--red)');
            if (lives <= 0) {
              showGameOver();
            }
            break;
          }
        }

        for (j = enemyBullets.length - 1; j >= 0; j--) {
          var shot = enemyBullets[j];
          if (Math.hypot(ship.x - shot.x, ship.y - shot.y) <= shot.r + 10) {
            enemyBullets.splice(j, 1);
            lives -= shot.damage;
            updateHud();
            resetCombo();
            ship.invuln = 1000;
            damageFlash = 220;
            setStatus('You took damage!', 'var(--red)');
            if (lives <= 0) showGameOver();
            break;
          }
        }
      }

      if (state === 'playing' && enemies.length === 0) {
        showBetweenWaveEvent();
      }
    }

    function step(dtMs) {
      if (state !== 'playing') return;
      var dt = dtMs / 16.666;
      updateShip(dt, dtMs);
      updateBullets(dt, dtMs);
      updateEnemies(dt, dtMs);
      updateDisaster(dt, dtMs);
      updateHealthPacks(dtMs);
      doCollisions();
      updateFeedback(dt, dtMs);
    }

    function drawShip(ctx) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.a);
      ctx.strokeStyle = ship.invuln > 0 ? '#f9e2af' : '#cdd6f4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -9);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-10, 9);
      ctx.closePath();
      ctx.stroke();

      if (keys.w || keys.W || keys.s || keys.S || keys.a || keys.A || keys.d || keys.D) {
        ctx.strokeStyle = '#f38ba8';
        ctx.beginPath();
        ctx.moveTo(-8, 0);
        ctx.lineTo(-16 - Math.random() * 5, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    function draw() {
      var ctx = canvas.getContext('2d');
      ctx.save();
      if (screenShake > 0) {
        ctx.translate(rand(-screenShake, screenShake), rand(-screenShake, screenShake));
      }
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, currentBiome ? currentBiome.bg : '#0c1427');
      g.addColorStop(1, '#070b12');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      if (damageFlash > 0) {
        ctx.fillStyle = 'rgba(243, 56, 56,' + Math.min(0.28, damageFlash / 800) + ')';
        ctx.fillRect(0, 0, W, H);
      }

      ctx.fillStyle = currentBiome && currentBiome.id === 'frost' ? '#89dceb' : '#1e1e2e';
      for (var s = 0; s < 80; s++) {
        var sx = (s * 71) % W;
        var sy = (s * 109) % H;
        ctx.fillRect(sx, sy, 2, 2);
      }

      if (activeDisaster && activeDisaster.id === 'gravitywell') {
        ctx.save();
        var grav = ctx.createRadialGradient(W / 2, H / 2, 18, W / 2, H / 2, 120);
        grav.addColorStop(0, 'rgba(137,180,250,0.35)');
        grav.addColorStop(1, 'rgba(137,180,250,0.02)');
        ctx.fillStyle = grav;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 120, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      var pulse = 0.7 + Math.sin(performance.now() * 0.008) * 0.2;

      enemies.forEach(function (e) {
        if (e.type === 'boss') {
          ctx.save();
          ctx.shadowBlur = 28;
          ctx.shadowColor = 'rgba(243, 139, 168, 0.95)';
          ctx.fillStyle = 'rgba(243, 139, 168, 0.88)';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#f9e2af';
          ctx.stroke();
          if (e.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.5, e.hitFlash / 220) + ')';
            ctx.fill();
          }
          ctx.restore();

          var hpw = 82;
          var h = 8;
          var ratio = Math.max(0, e.hp / e.maxHp);
          ctx.fillStyle = '#313244';
          ctx.fillRect(e.x - hpw / 2, e.y - e.r - 16, hpw, h);
          ctx.fillStyle = '#f38ba8';
          ctx.fillRect(e.x - hpw / 2, e.y - e.r - 16, hpw * ratio, h);
        } else if (e.type === 'hunter') {
          ctx.save();
          ctx.shadowBlur = 22;
          ctx.shadowColor = 'rgba(250, 179, 135, 0.95)';
          ctx.fillStyle = '#fab387';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          if (e.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.55, e.hitFlash / 180) + ')';
            ctx.fill();
          }
          ctx.shadowBlur = 0;
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          ctx.restore();
        } else if (e.type === 'bomber') {
          ctx.save();
          ctx.shadowBlur = 18;
          ctx.shadowColor = 'rgba(250, 179, 135, 0.95)';
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          if (e.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.55, e.hitFlash / 180) + ')';
            ctx.fill();
          }
          ctx.restore();
        } else if (e.type === 'shooter') {
          ctx.save();
          ctx.shadowBlur = 18;
          ctx.shadowColor = 'rgba(137, 180, 250, 0.95)';
          ctx.fillStyle = '#89b4fa';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          if (e.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.55, e.hitFlash / 180) + ')';
            ctx.fill();
          }
          ctx.restore();
        } else if (e.type === 'sonic') {
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(166, 227, 161, 0.95)';
          ctx.fillStyle = '#a6e3a1';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          if (e.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.55, e.hitFlash / 180) + ')';
            ctx.fill();
          }
          ctx.restore();
        } else if (e.type === 'tank') {
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(249, 226, 175, 0.95)';
          ctx.fillStyle = '#f9e2af';
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          if (e.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.55, e.hitFlash / 180) + ')';
            ctx.fill();
          }
          ctx.restore();
        } else {
          var glow = e.tier === 2 ? 'rgba(249, 226, 175, 0.95)' : (e.tier === 1 ? 'rgba(137, 220, 235, 0.95)' : 'rgba(166, 227, 161, 0.95)');
          var fill = e.tier === 2 ? '#f9e2af' : (e.tier === 1 ? '#89dceb' : '#a6e3a1');
          ctx.save();
          ctx.shadowBlur = 18 + e.tier * 6;
          ctx.shadowColor = glow;
          ctx.globalAlpha = pulse;
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
          ctx.fill();
          if (e.hitFlash > 0) {
            ctx.fillStyle = 'rgba(255,255,255,' + Math.min(0.55, e.hitFlash / 180) + ')';
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#ffffff';
          ctx.stroke();
          ctx.restore();
        }

        if (e.burnMs && e.burnMs > 0 && (e.fireStacks || 0) > 0) {
          var flameN = Math.min(5, Math.max(2, Math.round(e.fireStacks * 0.7)));
          var flamePulse = 0.75 + Math.sin(performance.now() * 0.02 + e.x * 0.04) * 0.25;
          for (var fi = 0; fi < flameN; fi++) {
            var ang = (Math.PI * 2 * fi) / flameN;
            var fx = e.x + Math.cos(ang) * (e.r * 0.55);
            var fy = e.y - e.r * 0.65 + Math.sin(ang) * (e.r * 0.12);
            ctx.save();
            ctx.globalAlpha = flamePulse;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#f97316';
            ctx.fillStyle = '#fb923c';
            ctx.beginPath();
            ctx.arc(fx, fy, 2.2 + (e.fireStacks || 0) * 0.16, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        if (e.type !== 'boss') {
          var barW = Math.max(24, e.r * 1.8);
          var ratio2 = Math.max(0, e.hp / (e.maxHp || e.hp || 1));
          var topY = e.y - e.r - 10;
          ctx.fillStyle = 'rgba(17,17,27,0.7)';
          ctx.fillRect(e.x - barW / 2, topY, barW, 5);
          ctx.fillStyle = '#a6e3a1';
          ctx.fillRect(e.x - barW / 2, topY, barW * ratio2, 5);
        }
      });

      ctx.fillStyle = '#a6e3a1';
      bullets.forEach(function (b) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      });

      enemyBullets.forEach(function (b) {
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      healthPacks.forEach(function (pack) {
        var glow = 0.7 + Math.sin(performance.now() * 0.012 + pack.x * 0.01) * 0.3;
        ctx.save();
        ctx.globalAlpha = glow;
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#22c55e';
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(pack.x, pack.y, pack.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ecfeff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pack.x - 4, pack.y);
        ctx.lineTo(pack.x + 4, pack.y);
        ctx.moveTo(pack.x, pack.y - 4);
        ctx.lineTo(pack.x, pack.y + 4);
        ctx.stroke();
        ctx.restore();
      });

      hitEffects.forEach(function (effect) {
        var alpha = Math.max(0, effect.life / effect.maxLife);
        ctx.save();
        ctx.strokeStyle = effect.crit ? 'rgba(249,226,175,' + alpha + ')' : 'rgba(137,220,235,' + alpha + ')';
        ctx.lineWidth = effect.crit ? 4 : 2;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      floatingTexts.forEach(function (text) {
        var alpha = Math.max(0, text.life / text.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = text.color;
        ctx.font = text.crit ? 'bold 18px "JetBrains Mono",monospace' : 'bold 14px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text.text, text.x, text.y);
        ctx.restore();
      });

      if (ship) drawShip(ctx);

      if (ship) {
        var overlayX = 14;
        var overlayY = 14;
        var overlayH = 144;
        ctx.fillStyle = 'rgba(17,17,27,0.72)';
        ctx.fillRect(overlayX, overlayY, 178, overlayH);
        ctx.strokeStyle = 'rgba(137,180,250,0.45)';
        ctx.strokeRect(overlayX, overlayY, 178, overlayH);
        ctx.fillStyle = '#cdd6f4';
        ctx.font = '12px "JetBrains Mono",monospace';
        ctx.fillText('SHIP STATS', overlayX + 10, overlayY + 18);
        ctx.fillText('SPD ' + upgrades.maxSpeed.toFixed(1), overlayX + 10, overlayY + 38);
        ctx.fillText('ROF ' + Math.round(1000 / upgrades.fireMs), overlayX + 10, overlayY + 54);
        ctx.fillText('DMG ' + upgrades.bulletDamage, overlayX + 10, overlayY + 70);
        ctx.fillText('CRT ' + Math.round(upgrades.critChance * 100) + '%', overlayX + 10, overlayY + 86);
        ctx.fillText('AIM ' + Math.round(upgrades.autoAim * 100), overlayX + 10, overlayY + 102);
        ctx.fillText('FIRE ' + fireStatusLabel(), overlayX + 10, overlayY + 118);
        ctx.fillText('C/L +' + Math.round(upgrades.closeRangeBonus * 100) + '/' + Math.round(upgrades.longRangeBonus * 100), overlayX + 10, overlayY + 134);
      }

      if (critPulse > 0) {
        var critAlpha = Math.min(1, critPulse / 320);
        ctx.save();
        ctx.globalAlpha = critAlpha;
        ctx.font = 'bold 28px "JetBrains Mono",monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f9e2af';
        ctx.fillText('CRITICAL HIT', W / 2, 42);
        ctx.restore();
      }

      if (activeDisaster) {
        ctx.save();
        ctx.font = 'bold 12px "JetBrains Mono",monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = activeDisaster.color;
        ctx.fillText('EVENT: ' + activeDisaster.name, W - 12, H - 14);
        ctx.restore();
      }

      ctx.restore();
    }

    function onKey(e) {
      if (!document.body.contains(r.win)) {
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keyup', onKey);
        running = false;
        return;
      }
      if (r.win.classList.contains('wm-hidden') || !r.win.classList.contains('focused')) {
        if (e.type === 'keyup') keys[e.key] = false;
        return;
      }

      if (e.type === 'keydown') {
        keys[e.key] = true;
        if (e.key === ' ') e.preventDefault();
        if (e.key === 'Enter' && state === 'gameover') {
          e.preventDefault();
          clearOverlay();
          startRun();
        }
      } else {
        keys[e.key] = false;
      }
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);

    var obs = new MutationObserver(function () {
      if (!document.body.contains(r.win)) {
        running = false;
        document.removeEventListener('keydown', onKey);
        document.removeEventListener('keyup', onKey);
        clearOverlay();
        obs.disconnect();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });

    function loop(ts) {
      if (!running || !document.body.contains(r.win)) {
        running = false;
        return;
      }
      var dtMs = lastTime ? Math.min(ts - lastTime, 40) : 16;
      lastTime = ts;
      step(dtMs);
      draw();
      requestAnimationFrame(loop);
    }

    ship = makeShip();
    updateHud();
    showMainMenu();
    requestAnimationFrame(loop);
  }

  window.Site.openAsteroids = openAsteroids;

})();
