<script>
  export let password = "";

  // 密码强度计算
  function calculatePasswordStrength(pwd) {
    if (!pwd) return 0;

    let strength = 0;
    if (pwd.length >= 6) strength += 1;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/(?=.*[a-z])/.test(pwd)) strength += 1;
    if (/(?=.*[A-Z])/.test(pwd)) strength += 1;
    if (/(?=.*\d)/.test(pwd)) strength += 1;
    if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(pwd)) strength += 1;

    return Math.min(strength, 5); // 最高5级
  }

  // 获取密码强度文本
  function getPasswordStrengthText(strength) {
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  }

  // 获取密码强度颜色
  function getPasswordStrengthColor(strength) {
    if (strength <= 2) return "#e53e3e"; // 红色
    if (strength <= 3) return "#dd6b20"; // 橙色
    if (strength <= 4) return "#38a169"; // 绿色
    return "#2d7d32"; // 深绿色
  }

  $: passwordStrength = calculatePasswordStrength(password);
  $: strengthText = getPasswordStrengthText(passwordStrength);
  $: strengthColor = getPasswordStrengthColor(passwordStrength);
  $: strengthWidth = (passwordStrength / 5) * 100;
</script>

{#if password && password.length > 0}
  <div class="password-strength">
    <div class="strength-label">Password Strength:</div>
    <div class="strength-bar">
      <div
        class="strength-fill"
        style="width: {strengthWidth}%; background-color: {strengthColor};"
      ></div>
    </div>
    <div class="strength-text" style="color: {strengthColor};">
      {strengthText}
    </div>
  </div>
{/if}

<style>
  .password-strength {
    margin: 8px 0 16px 0;
    padding: 12px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .strength-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .strength-bar {
    width: 100%;
    height: 6px;
    background: #e2e8f0;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 6px;
  }

  .strength-fill {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 3px;
  }

  .strength-text {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }
</style>
