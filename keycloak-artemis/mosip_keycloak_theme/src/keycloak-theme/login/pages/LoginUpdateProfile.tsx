import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { useGetClassName } from "keycloakify/login/lib/useGetClassName";
import type { KcContext } from "../kcContext";
import type { I18n } from "../i18n";

export default function LoginUpdateProfile(props: PageProps<Extract<KcContext, { pageId: "login-update-profile.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { getClassName } = useGetClassName({
        doUseDefaultCss,
        classes
    });

    const { msg, msgStr } = i18n;

    const { url, user, messagesPerField, isAppInitiatedAction } = kcContext;

    return (
        <Template {...{ kcContext, i18n, doUseDefaultCss, classes }} headerNode={
            <>
                <h2 id="kc-page-title" className="text-3xl font-bold text-hTextColor font-inter" >{msg("loginProfileTitle")}</h2>
                <p className="text-pTextColor text-xl font-inter mt-2">{msg("UpdateDetailsDesc")}</p>
            </>
        }>
            <form id="kc-update-profile-form" className={getClassName("kcFormClass")} action={url.loginAction} method="post">
                {user.editUsernameAllowed && (
                    <div
                        className={clsx(
                            getClassName("kcFormGroupClass"),
                            messagesPerField.printIfExists("username", getClassName("kcFormGroupErrorClass"))
                        )}
                    >
                        <div className={getClassName("kcLabelWrapperClass")}>
                            <label htmlFor="username" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                                {msg("username")}
                            </label>
                        </div>
                        <div className={getClassName("kcInputWrapperClass")}>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                autoComplete="off"
                                placeholder={msgStr("userNamePH")}
                                defaultValue={user.username ?? ""}
                                className={(getClassName("kcInputClass"), 'outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter border-bColor')}
                            />
                        </div>
                    </div>
                )}

                <div
                    className={clsx(getClassName("kcFormGroupClass"), messagesPerField.printIfExists("email", getClassName("kcFormGroupErrorClass")))}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="email" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                            {msg("email")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input type="text" id="email" name="email" autoComplete="off" placeholder={msgStr("emailPH")} defaultValue={user.email ?? ""} className={(getClassName("kcInputClass"), 'outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter border-bColor')} />
                    </div>
                </div>

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("firstName", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="firstName" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                            {msg("firstName")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder={msgStr("firstNamePH")}
                            defaultValue={user.firstName ?? ""}
                            autoComplete="off"
                            className={(getClassName("kcInputClass"), 'outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter border-bColor')}
                        />
                    </div>
                </div>

                <div
                    className={clsx(
                        getClassName("kcFormGroupClass"),
                        messagesPerField.printIfExists("lastName", getClassName("kcFormGroupErrorClass"))
                    )}
                >
                    <div className={getClassName("kcLabelWrapperClass")}>
                        <label htmlFor="lastName" className={(getClassName("kcLabelClass"), 'mb-1 font-bold font-inter text-xl text-hTextColor')}>
                            {msg("lastName")}
                        </label>
                    </div>
                    <div className={getClassName("kcInputWrapperClass")}>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            autoComplete="off"
                            placeholder={msgStr("lastNamePH")}
                            defaultValue={user.lastName ?? ""}
                            className={(getClassName("kcInputClass"), 'outline-none border border-solid h-14 rounded-lg w-full px-3 font-inter border-bColor')}
                        />
                    </div>
                </div>

                <div className={getClassName("kcFormGroupClass")}>
                    <div id="kc-form-options" className={getClassName("kcFormOptionsClass")}>
                        <div className={getClassName("kcFormOptionsWrapperClass")} />
                    </div>

                    <div id="kc-form-buttons" className={getClassName("kcFormButtonsClass")}>
                        {isAppInitiatedAction ? (
                            <>
                                <input
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonPrimaryClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    type="submit"
                                    defaultValue={msgStr("doSubmit")}
                                />
                                <button
                                    className={clsx(
                                        getClassName("kcButtonClass"),
                                        getClassName("kcButtonDefaultClass"),
                                        getClassName("kcButtonLargeClass")
                                    )}
                                    type="submit"
                                    name="cancel-aia"
                                    value="true"
                                >
                                    {msg("doCancel")}
                                </button>
                            </>
                        ) : (
                            <input
                                className={clsx(
                                    getClassName("kcButtonClass"),
                                    getClassName("kcButtonPrimaryClass"),
                                    getClassName("kcButtonBlockClass"),
                                    getClassName("kcButtonLargeClass")
                                )}
                                type="submit"
                                defaultValue={msgStr("doSubmit")}
                            />
                        )}
                    </div>
                </div>
            </form>
        </Template>
    );
}