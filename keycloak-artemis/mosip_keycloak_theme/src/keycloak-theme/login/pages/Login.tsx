import { useState, type FormEventHandler } from "react";
import { clsx } from "keycloakify/tools/clsx";
import { useConstCallback } from "keycloakify/tools/useConstCallback";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";
import eyeIcon from '../assets/visibility_FILL0_wght400_GRAD0_opsz48.svg';
import eyeIconOff from '../assets/visibility_off.svg'

const my_custom_param = new URL(window.location.href).searchParams.get("my_custom_param");

if (my_custom_param !== null) {
    console.log("my_custom_param:", my_custom_param);
}

export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });
    const { social, realm, url, usernameHidden, login, auth, registrationDisabled } = kcContext;
    const { msg, msgStr } = i18n;

    // const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);
    const [dirtyLoginData, setLoginData] = useState(login);
    const [passwordType, setPasswordType] = useState('password');
    const [isReloadBtn, setReloadBtn] = useState(false);

    const label = !realm.loginWithEmailAllowed
        ? "username"
        : realm.registrationEmailAsUsername
            ? "email"
            : "usernameOrEmail";

    const autoCompleteHelper: typeof label = label === "usernameOrEmail" ? "username" : label;


    const onSubmit = useConstCallback<FormEventHandler<HTMLFormElement>>(e => {
        e.preventDefault();
        // setIsLoginButtonDisabled(true);

        const formElement = e.target as HTMLFormElement;
        //NOTE: Even if we login with email Keycloak expect username and password in
        //the POST request.
        formElement.querySelector("input[name='email']")?.setAttribute("name", "username");

        formElement.submit();
    });

    window.onbeforeunload = function() {
        if(!isReloadBtn && !localStorage.getItem("isLocaleopen")){
            return 'Do you want to leave this page?'
        }
    }

    const showPassword = () => {
        passwordType === 'password' ? setPasswordType('text') : setPasswordType('password')
    }

    const handleLogInData = (event: any) => {
        const { name, value } = event.target;
        setLoginData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    return (
        <Template
            {...{ kcContext, i18n, doUseDefaultCss, classes }}
            displayInfo={
                realm.password &&
                realm.registrationAllowed &&
                !registrationDisabled
            }
            displayWide={realm.password && social.providers !== undefined}
            headerNode={
                <>
                    <h2 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-inter" >{msg("doLogIn")}</h2>
                    <p className="text-pTextColor text-xl font-inter mt-2">{msg("loginDesc")}</p>
                </>
            }
            infoNode={
                <div id="kc-registration" className="text-center mt-4 font-inter">
                    <span onClick={() => setReloadBtn(true)}>
                        {msg("noAccount")} &nbsp;
                        <a className="text-hLinkColor font-semibold" tabIndex={6} href={url.registrationUrl}>
                            {msg("doRegister")}
                        </a>
                    </span>
                </div>
            }
        >
            <div id="kc-form" className={clsx(realm.password && social.providers !== undefined && getClassName("kcContentWrapperClass"))}>
                <div
                    id="kc-form-wrapper"
                    className={clsx(
                        realm.password &&
                        social.providers && [getClassName("kcFormSocialAccountContentClass"), getClassName("kcFormSocialAccountClass")]
                    )}
                >
                    {realm.password && (
                        <form id="kc-form-login" onSubmit={onSubmit} action={url.loginAction} method="post">
                            <div className={getClassName("kcFormGroupClass")}>
                                {!usernameHidden &&
                                    (() => {

                                        return (
                                            <>
                                                <label htmlFor={autoCompleteHelper} className={(getClassName("kcLabelClass"), 'text-hTextColor text-xl font-inter')}>
                                                    {msg('userNameLable')}
                                                </label>
                                                <div className="border border-bColor border-solid rounded-lg h-14 w-full p-2 font-inter">
                                                    <input
                                                        tabIndex={1}
                                                        id={autoCompleteHelper}
                                                        className={(getClassName("kcInputClass"), 'border-none w-full outline-none p-1')}
                                                        //NOTE: This is used by Google Chrome auto fill so we use it to tell
                                                        //the browser how to pre fill the form but before submit we put it back
                                                        //to username because it is what keycloak expects.
                                                        name={autoCompleteHelper}
                                                        defaultValue={login.username ?? ""}
                                                        placeholder={msgStr('namePlaceholder')}
                                                        type="text"
                                                        autoFocus={true}
                                                        autoComplete="off"
                                                        onChange={handleLogInData}
                                                    />
                                                </div>
                                            </>
                                        );
                                    })()}
                            </div>
                            <div className={getClassName("kcFormGroupClass")}>
                                <label htmlFor="password" className={(getClassName("kcLabelClass"), 'text-hTextColor text-xl flex flex-row items-center font-inter')}>
                                    <span>{msg("password")} </span>
                                </label>
                                <div className="flex flex-row justify-between items-center border border-bColor border-solid rounded-lg h-14 p-2 font-inter">
                                    <input
                                        tabIndex={2}
                                        id="password"
                                        className={(getClassName("kcInputClass"), 'border-none w-11/12 outline-none')}
                                        name="password"
                                        placeholder={msgStr('passwordPlaceholder')}
                                        type={passwordType}
                                        autoComplete="off"
                                        onChange={handleLogInData}
                                    />
                                    {passwordType === 'password' ? <img className="cursor-pointer" onClick={showPassword} alt="" src={eyeIcon} /> : <img className="cursor-pointer" onClick={showPassword} alt="" src={eyeIconOff} />}
                                </div>
                            </div>
                            <div className={clsx(getClassName("kcFormGroupClass"), getClassName("kcFormSettingClass"))}>
                                <div id="kc-form-options">
                                    {realm.rememberMe && !usernameHidden && (
                                        <div className="checkbox">
                                            <label>
                                                <input
                                                    tabIndex={3}
                                                    id="rememberMe"
                                                    name="rememberMe"
                                                    type="checkbox"
                                                    className="font-inter"
                                                    {...(login.rememberMe === "on"
                                                        ? {
                                                            "checked": true
                                                        }
                                                        : {})}
                                                />
                                                {msg("rememberMe")}
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className={(getClassName("kcFormOptionsWrapperClass"), 'text-hLinkColor font-bold text-right font-inter')}>
                                    {realm.resetPasswordAllowed && (
                                        <span onClick={() => setReloadBtn(true)}>
                                            <a tabIndex={5} href={url.loginResetCredentialsUrl}>
                                                {msg("doForgotPassword")}
                                            </a>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div id="kc-form-buttons" className={(getClassName("kcFormGroupClass"), 'font-inter')}>
                                <input
                                    type="hidden"
                                    id="id-hidden-input"
                                    name="credentialId"
                                    {...(auth?.selectedCredential !== undefined
                                        ? {
                                            "value": auth.selectedCredential
                                        }
                                        : {})}
                                />
                                <input
                                    tabIndex={4}
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonPrimaryClass"),
                                        getClassName("kcButtonBlockClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    name="login"
                                    id="kc-login"
                                    type="submit"
                                    value={msgStr("doLogIn")}
                                    onClick={() => setReloadBtn(true)}
                                    disabled={(!dirtyLoginData[autoCompleteHelper] && !dirtyLoginData?.username && !auth.attemptedUsername) || !dirtyLoginData.password}
                                />
                            </div>
                        </form>
                    )}
                </div>
                {realm.password && social.providers !== undefined && (
                    <div
                        id="kc-social-providers"
                        className={clsx(getClassName("kcFormSocialAccountContentClass"), getClassName("kcFormSocialAccountClass"))}
                    >
                        <ul
                            className={clsx(
                                getClassName("kcFormSocialAccountListClass"),
                                social.providers.length > 4 && getClassName("kcFormSocialAccountDoubleListClass")
                            )}
                        >
                            {social.providers.map(p => (
                                <li key={p.providerId} className={getClassName("kcFormSocialAccountListLinkClass")}>
                                    <a href={p.loginUrl} id={`zocial-${p.alias}`} className={clsx("zocial", p.providerId)}>
                                        <span>{p.displayName}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Template>
    );
}
