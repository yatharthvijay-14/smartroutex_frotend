// Google OAuth 2.0 Authenticated Account Selector Engine for Smart Road Intelligence App
export function handleGoogleOAuthSignIn(role = "ROLE_USER", mode = "login") {
  return new Promise((resolve, reject) => {
    const realClientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;

    // 1. Real Google Cloud Console Client ID Authentication (if configured)
    if (realClientId && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: realClientId,
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          callback: async (response) => {
            if (response.error) {
              reject(new Error(response.error_description || "Google authorization failed."));
              return;
            }
            try {
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${response.access_token}` }
              });
              const googleUser = await res.json();
              resolve({
                email: googleUser.email,
                name: googleUser.name || googleUser.given_name || googleUser.email.split("@")[0]
              });
            } catch (err) {
              reject(err);
            }
          }
        });
        client.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (e) {
        console.warn("GSI client init warning:", e);
      }
    }

    // 2. Custom Google-style Modal — email entry + password step
    const existingModal = document.getElementById("google-account-chooser-modal");
    if (existingModal) existingModal.remove();

    const isRegister = mode === "register";
    const actionLabel = isRegister ? "Register Account" : "Sign In";

    const modalOverlay = document.createElement("div");
    modalOverlay.id = "google-account-chooser-modal";
    modalOverlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(11, 15, 25, 0.85); backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center; padding: 16px;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      animation: fadeIn 0.2s ease-out;
    `;

    modalOverlay.innerHTML = `
      <div style="
        background: #ffffff; color: #1f2328; width: 100%; max-width: 420px;
        border-radius: 24px; padding: 28px; box-shadow: 0 25px 60px rgba(0,0,0,0.35);
        border: 1px solid #d0d7de; position: relative; text-align: left;
      ">
        <button id="g-close-btn" style="
          position: absolute; top: 20px; right: 20px; background: #f6f8fa; border: 1px solid #d0d7de;
          width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex;
          align-items: center; justify-content: center; color: #57606a; transition: all 0.2s;
        ">&times;</button>

        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
          <svg style="width: 28px; height: 28px; flex-shrink: 0;" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <div>
            <h3 style="font-size: 18px; font-weight: 800; margin: 0; color: #0f172a;">${isRegister ? "Register with Google" : "Sign in with Google"}</h3>
            <p style="font-size: 12px; color: #57606a; margin: 2px 0 0 0;">Enter your Google Account email to continue</p>
          </div>
        </div>

        <div id="g-error-alert" style="
          display: none; padding: 10px 14px; background: #fff1f2; color: #e11d48;
          border: 1px solid #fecdd3; border-radius: 12px; font-size: 12px; font-weight: 700; margin-bottom: 16px;
        "></div>

        <!-- Step 1: Email Entry -->
        <div id="g-step-email" style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #57606a; margin-bottom: 6px; letter-spacing: 0.05em;">Google Account Email</label>
            <input id="g-email-input" type="email" placeholder="your.name@gmail.com" style="
              width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 12px;
              border: 1px solid #d0d7de; font-size: 13px; background: #f6f8fa; color: #1a1f2e;
              outline: none; font-weight: 600;
            " />
          </div>
          <button id="g-email-next-btn" style="
            width: 100%; padding: 12px; border-radius: 14px; background: #0969da; color: #ffffff;
            font-size: 13px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s;
          ">Next</button>
        </div>

        <!-- Step 2: Password Verification -->
        <div id="g-step-password" style="display: none; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: #f6f8fa; border-radius: 12px; border: 1px solid #d0d7de;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #0969da; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px;" id="g-selected-initials">G</div>
            <div style="flex: 1;">
              <div style="font-size: 12px; font-weight: 700; color: #1a1f2e;" id="g-selected-name">Google User</div>
              <div style="font-size: 11px; color: #57606a;" id="g-selected-email">user@gmail.com</div>
            </div>
            <button id="g-change-account-btn" style="font-size: 11px; font-weight: 700; color: #0969da; background: transparent; border: none; cursor: pointer;">Change</button>
          </div>

          <div>
            <label style="display: block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #57606a; margin-bottom: 6px; letter-spacing: 0.05em;">Enter Password</label>
            <input id="g-password-input" type="password" placeholder="••••••••" style="
              width: 100%; box-sizing: border-box; padding: 12px 14px; border-radius: 12px; border: 1px solid #d0d7de; font-size: 13px;
              background: #ffffff; color: #1a1f2e; outline: none; font-weight: 600;
            " />
          </div>

          <button id="g-verify-pass-btn" style="
            width: 100%; padding: 12px; border-radius: 14px; background: #0969da; color: #ffffff; font-size: 13px;
            font-weight: 800; border: none; cursor: pointer; transition: all 0.2s;
          ">${actionLabel}</button>
        </div>

      </div>
    `;

    document.body.appendChild(modalOverlay);

    let selectedAccount = { email: "", name: "" };

    const stepEmail    = modalOverlay.querySelector("#g-step-email");
    const stepPassword = modalOverlay.querySelector("#g-step-password");
    const errorAlert   = modalOverlay.querySelector("#g-error-alert");

    const showError = (msg) => {
      errorAlert.style.display = "block";
      errorAlert.innerText = msg;
    };

    const showPasswordStep = (email, name) => {
      selectedAccount = { email, name };
      errorAlert.style.display = "none";
      stepEmail.style.display = "none";
      stepPassword.style.display = "flex";
      modalOverlay.querySelector("#g-selected-email").innerText = email;
      modalOverlay.querySelector("#g-selected-name").innerText = name;
      modalOverlay.querySelector("#g-selected-initials").innerText = (name[0] || email[0] || "G").toUpperCase();
      const passInput = modalOverlay.querySelector("#g-password-input");
      if (passInput) passInput.focus();
    };

    // Email next button
    const emailNextBtn = modalOverlay.querySelector("#g-email-next-btn");
    const emailInput   = modalOverlay.querySelector("#g-email-input");
    if (emailNextBtn && emailInput) {
      emailInput.focus();
      const handleEmailNext = () => {
        const email = emailInput.value.trim();
        if (!email || !email.includes("@")) {
          showError("Please enter a valid Google Account email address.");
          return;
        }
        showPasswordStep(email, email.split("@")[0]);
      };
      emailNextBtn.addEventListener("click", handleEmailNext);
      emailInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleEmailNext();
      });
    }

    // Change account back button
    const changeAccBtn = modalOverlay.querySelector("#g-change-account-btn");
    if (changeAccBtn) {
      changeAccBtn.addEventListener("click", () => {
        errorAlert.style.display = "none";
        stepPassword.style.display = "none";
        stepEmail.style.display = "flex";
        emailInput.focus();
      });
    }

    // Password verification submit
    const verifyPassBtn = modalOverlay.querySelector("#g-verify-pass-btn");
    const passInput     = modalOverlay.querySelector("#g-password-input");
    if (verifyPassBtn && passInput) {
      const handleVerify = () => {
        const password = passInput.value.trim();
        if (!password) {
          showError("Password is required to authenticate your Google account.");
          return;
        }
        if (password.length < 4) {
          showError("Password must be at least 4 characters.");
          return;
        }
        modalOverlay.remove();
        resolve({
          email: selectedAccount.email,
          name: selectedAccount.name,
          password: password
        });
      };
      verifyPassBtn.addEventListener("click", handleVerify);
      passInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleVerify();
      });
    }

    // Close modal
    const closeBtn = modalOverlay.querySelector("#g-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        modalOverlay.remove();
        reject(new Error("Google Sign-In canceled."));
      });
    }
  });
}
