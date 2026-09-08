// =============================================
// navigation.js
// Global Header & Sidebar
// =============================================

function getNavigationItems(role, permissions = {}) {

    const items = [

        {
            name: "Dashboard",
            icon: "fa-house",
            link: "dashboard.html",
            section: "dashboard",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE","TECH_SUPERVISOR"]
        },

        {
            name: "Material Categories",
            icon: "fa-tags",
            link: "material_categories.html",
            section: "material_categories",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE"]
        },

        {
            name: "Material Master",
            icon: "fa-box-open",
            link: "materials.html",
            section: "material_master",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE"]
        },

        {
            name: "Raise Request",
            icon: "fa-file-signature",
            link: "material_request.html",
            section: "raise_request",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE","TECH_SUPERVISOR"]
        },

        {
            name: "Approvals",
            icon: "fa-clipboard-check",
            link: "approvals.html",
            section: "approvals",
            roles: ["ADMIN","FM","AFM"]
        },

        {
            name: "Issue Materials",
            icon: "fa-right-from-bracket",
            link: "issue.html",
            section: "issue_materials",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE"]
        },

        {
            name: "Returns",
            icon: "fa-rotate-left",
            link: "return.html",
            section: "returns",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE"]
        },

        {
            name: "Stock Entry",
            icon: "fa-truck-ramp-box",
            link: "stock_entry.html",
            section: "stock_entry",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE"]
        },

        {
            name: "Current Stock",
            icon: "fa-boxes-stacked",
            link: "current_stock.html",
            section: "current_stock",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE"]
        },

        {
            name: "Reports",
            icon: "fa-chart-line",
            link: "reports.html",
            section: "reports",
            roles: ["ADMIN","FM","AFM","STOREKEEPER","STORE","TECH_SUPERVISOR"]
        },

        {
            name: "User Management",
            icon: "fa-users-gear",
            link: "users.html",
            section: "user_management",
            roles: ["ADMIN"]
        }

    ];


    return items.filter(item => {

        // User must first belong to the role
        if (!item.roles.includes(role)) {
            return false;
        }

        // ADMIN keeps full access
        if (role === "ADMIN") {
            return true;
        }

        // If permission exists, use it
        if (
            Object.prototype.hasOwnProperty.call(
                permissions,
                item.section
            )
        ) {
            return permissions[item.section] === true;
        }

        // No permission record = deny
        return false;

    });

}
async function loadNavigationPermissions(userId) {

    const permissions = {};

    // ADMIN always gets full access
    const user = getCurrentUser();

    if (user && user.role === "ADMIN") {
        return permissions;
    }

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("user_permissions")

            .select(`
                section_key,
                is_allowed
            `)

            .eq("user_id", userId);


        if (error)
            throw error;


        (data || []).forEach(permission => {

            permissions[
                permission.section_key
            ] = permission.is_allowed === true;

        });


    } catch (error) {

        console.error(
            "Navigation Permission Error:",
            error
        );

    }


    return permissions;

}
async function renderSidebar() {

    const user = getCurrentUser();

    if (!user) return;


    const container =
        document.getElementById("globalSidebar");

    if (!container) return;


    // Load individual section permissions
    const permissions =
        await loadNavigationPermissions(user.id);


    const menu =
        getNavigationItems(
            user.role,
            permissions
        );


    let html = `
        <div class="sidebar">

            <div class="sidebar-title">
                RVRG
            </div>

            <ul class="nav flex-column">
    `;


    menu.forEach(item => {

        const active =
            window.location.pathname.endsWith(
                item.link
            )
            ? "active"
            : "";


        html += `

            <li>

                <a
                    href="${item.link}"
                    class="nav-link ${active}">

                    <i class="fa-solid ${item.icon}"></i>

                    <span>${item.name}</span>

                </a>

            </li>

        `;

    });


    html += `

            <li class="mt-auto">

                <a
                    href="#"
                    class="nav-link text-danger"
                    onclick="logout()">

                    <i class="fa-solid fa-right-from-bracket"></i>

                    <span>Logout</span>

                </a>

            </li>

        </ul>

    </div>

    `;


    container.innerHTML = html;

}

function renderHeader() {

    const user = getCurrentUser();

    if (!user) return;

    const header = document.getElementById("appHeader");

    if (!header) return;

    header.innerHTML = `

<div class="app-header">

    <div class="header-left">

    <button id="menuToggle">
        <i class="fa-solid fa-bars"></i>
    </button>

    <img src="RVRG LOGO.jpg"
         alt="Logo"
         class="header-logo">

    <div class="header-title">

    <div class="title-main">
        RVRG Store Management
    </div>

    <div class="title-divider"></div>

    <div class="title-sub">
        Developed by CBRE
    </div>

</div>

</div>

    <div class="header-center">

        <span id="liveDateTime"></span>

    </div>

    <div class="header-right">

    <img src="cbre_green.png"
         class="cbre-logo"
         alt="CBRE">

   <div
    id="notificationContainer"
    style="
        position:relative;
        display:inline-flex;
        align-items:center;
        margin-right:15px;
    "
>

    <button
        type="button"
        id="notificationBell"
        class="btn btn-link p-0 position-relative"
        style="
            color:inherit;
            text-decoration:none;
        "
        title="Notifications"
    >

        <i
            class="fa-solid fa-bell notification-icon"
            style="font-size:18px;"
        ></i>


        <span
            id="notificationBadge"
            class="position-absolute badge rounded-pill bg-danger d-none"
            style="
                top:-7px;
                right:-9px;
                font-size:10px;
                min-width:17px;
                height:17px;
                padding:3px 4px;
            "
        >
            0
        </span>

    </button>


    <div
        id="notificationDropdown"
        class="card shadow-lg d-none"
        style="
            position:absolute;
            top:30px;
            right:0;
            width:360px;
            max-width:90vw;
            z-index:99999;
        "
    >

        <div
            class="card-header d-flex justify-content-between align-items-center"
        >

            <strong>
                Notifications
            </strong>

            <button
                type="button"
                id="markAllNotificationsRead"
                class="btn btn-sm btn-link"
            >
                Mark all read
            </button>

        </div>


        <div
            id="notificationList"
            style="
                max-height:400px;
                overflow-y:auto;
            "
        >

            <div
                class="text-center text-muted py-4"
            >
                Loading notifications...
            </div>

        </div>

    </div>

</div>

    <i class="fa-solid fa-circle-user"></i>

    <strong>${user.name}</strong>

    <small>(${user.role})</small>

</div>

</div>

`;

}

function startClock() {

    const label = document.getElementById("liveDateTime");

    if (!label) return;

    function updateClock() {
        label.innerHTML = new Date().toLocaleString("en-IN");
    }

    updateClock();

    setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded",()=>{

    renderHeader();

    renderSidebar();

    startClock();

});

// ====================================================
// NOTIFICATION SYSTEM
// ====================================================

let notificationRealtimeChannel = null;


// ====================================================
// INITIALIZE NOTIFICATIONS
// ====================================================

async function initializeNotifications() {

const user =
    getCurrentUser();

if (!user) {
    return;
}

// Unlock browser audio after first user interaction
document.addEventListener(
    "click",
    unlockNotificationAudio,
    {
        once: true
    }
);

// Load existing notifications

    await loadNotifications();


    // Start realtime listener

    startNotificationRealtime();


    // Bell click

    const bell =
        document.getElementById(
            "notificationBell"
        );


    const dropdown =
        document.getElementById(
            "notificationDropdown"
        );


    if (bell && dropdown) {

        bell.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                dropdown.classList.toggle(
                    "d-none"
                );

            }
        );

    }


    // Mark all read

    const markAllButton =
        document.getElementById(
            "markAllNotificationsRead"
        );


    if (markAllButton) {

        markAllButton.addEventListener(
            "click",
            async function(event) {

                event.stopPropagation();

                await markAllNotificationsRead();

            }
        );

    }


    // Close dropdown outside

    document.addEventListener(
        "click",
        function(event) {

            const container =
                document.getElementById(
                    "notificationContainer"
                );


            if (
                container &&
                !container.contains(
                    event.target
                )
            ) {

                const dropdown =
                    document.getElementById(
                        "notificationDropdown"
                    );


                if (dropdown) {

                    dropdown.classList.add(
                        "d-none"
                    );

                }

            }

        }
    );

}


// ====================================================
// LOAD USER NOTIFICATIONS
// ====================================================

async function loadNotifications() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    const list =
        document.getElementById(
            "notificationList"
        );


    if (!list) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from(
                "notifications"
            )

            .select(`
                id,
                user_id,
                title,
                message,
                notification_type,
                is_read,
                reference_id,
                created_at
            `)

            .eq(
                "user_id",
                user.id
            )

            .order(
                "created_at",
                {
                    ascending: false
                }
            )

            .limit(50);


        if (error) {
            throw error;
        }


        renderNotifications(
            data || []
        );

    }
    catch (error) {

        console.error(
            "Notification Load Error:",
            error
        );

        list.innerHTML = `

            <div
                class="text-center text-danger py-4 small"
            >
                Unable to load notifications.
            </div>

        `;

    }

}


// ====================================================
// RENDER NOTIFICATION LIST
// ====================================================

function renderNotifications(
    notifications
) {

    const list =
        document.getElementById(
            "notificationList"
        );


    const badge =
        document.getElementById(
            "notificationBadge"
        );


    if (!list) {
        return;
    }


    const unreadCount =
        notifications.filter(
            notification =>
                notification.is_read !== true
        ).length;


    // ---------------------------------------------
    // BADGE
    // ---------------------------------------------

    if (badge) {

        if (unreadCount > 0) {

            badge.innerText =
                unreadCount > 99
                    ? "99+"
                    : unreadCount;

            badge.classList.remove(
                "d-none"
            );

        }
        else {

            badge.innerText =
                "0";

            badge.classList.add(
                "d-none"
            );

        }

    }


    // ---------------------------------------------
    // EMPTY
    // ---------------------------------------------

    if (
        !notifications ||
        notifications.length === 0
    ) {

        list.innerHTML = `

            <div
                class="text-center text-muted py-5"
            >

                <i
                    class="fa-regular fa-bell-slash mb-2"
                    style="font-size:24px;"
                ></i>

                <div>
                    No notifications
                </div>

            </div>

        `;

        return;

    }


    // ---------------------------------------------
    // BUILD LIST
    // ---------------------------------------------

    list.innerHTML = "";


    notifications.forEach(
        notification => {

            const item =
                document.createElement(
                    "div"
                );


            item.style.padding =
                "12px 14px";


            item.style.borderBottom =
                "1px solid #eeeeee";


            item.style.cursor =
                "pointer";


            if (
                notification.is_read !== true
            ) {

                item.style.background =
                    "#f1f7ff";

            }
            else {

                item.style.background =
                    "#ffffff";

            }


            const dateText =
                notification.created_at
                    ? new Date(
                        notification.created_at
                    ).toLocaleString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        }
                    )
                    : "";


            item.innerHTML = `

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        align-items:flex-start;
                    "
                >

                    <strong
                        style="
                            font-size:13px;
                        "
                    >
                        ${escapeNotificationText(
                            notification.title
                        )}
                    </strong>

                    ${
                        notification.is_read
                            ? ""
                            : `
                                <span
                                    class="badge bg-primary"
                                    style="
                                        font-size:9px;
                                    "
                                >
                                    NEW
                                </span>
                            `
                    }

                </div>


                <div
                    style="
                        font-size:12px;
                        color:#555;
                        margin-top:4px;
                    "
                >
                    ${escapeNotificationText(
                        notification.message || ""
                    )}
                </div>


                <div
                    style="
                        font-size:10px;
                        color:#999;
                        margin-top:5px;
                    "
                >
                    ${dateText}
                </div>

            `;


            item.addEventListener(
                "click",
                async function() {

                    await markNotificationAsRead(
                        notification.id
                    );


                    openNotificationTarget(
                        notification
                    );

                }
            );


            list.appendChild(
                item
            );

        }
    );

}


// ====================================================
// REALTIME LISTENER
// ====================================================

function startNotificationRealtime() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    // Prevent duplicate channels

    if (
        notificationRealtimeChannel
    ) {

        try {

            supabaseClient.removeChannel(
                notificationRealtimeChannel
            );

        }
        catch (error) {

            console.warn(
                "Notification channel cleanup warning:",
                error
            );

        }

    }


    notificationRealtimeChannel =
        supabaseClient

            .channel(
                "rvrg-notifications-" +
                user.id
            )

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter:
                        `user_id=eq.${user.id}`
                },
                async function(payload) {

                    console.log(
                        "New Notification:",
                        payload.new
                    );


await loadNotifications();

playNotificationSound();

showNotificationToast(
    payload.new
);

                }
            )

            .subscribe(
                status => {

                    console.log(
                        "Notification Realtime:",
                        status
                    );

                }
            );

}


// ====================================================
// MARK ONE NOTIFICATION AS READ
// ====================================================

async function markNotificationAsRead(
    notificationId
) {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from(
                "notifications"
            )

            .update({
                is_read: true
            })

            .eq(
                "id",
                notificationId
            )

            .eq(
                "user_id",
                user.id
            );


        if (error) {
            throw error;
        }


        await loadNotifications();

    }
    catch (error) {

        console.error(
            "Mark Notification Error:",
            error
        );

    }

}


// ====================================================
// MARK ALL NOTIFICATIONS READ
// ====================================================

async function markAllNotificationsRead() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient

            .from(
                "notifications"
            )

            .update({
                is_read: true
            })

            .eq(
                "user_id",
                user.id
            )

            .eq(
                "is_read",
                false
            );


        if (error) {
            throw error;
        }


        await loadNotifications();

    }
    catch (error) {

        console.error(
            "Mark All Notifications Error:",
            error
        );

    }

}


// ====================================================
// OPEN NOTIFICATION TARGET
// ====================================================

function openNotificationTarget(
    notification
) {

    const type =
        notification
            ?.notification_type;


    // ---------------------------------------------
    // NEW REQUEST → APPROVALS
    // ---------------------------------------------

    if (
        type === "NEW_REQUEST"
    ) {

        window.location.href =
            "approvals.html";

        return;

    }


    // ---------------------------------------------
    // REQUEST APPROVED → ISSUE MATERIALS
    // ---------------------------------------------

    if (
        type === "REQUEST_APPROVED"
    ) {

        window.location.href =
            "issue.html";

        return;

    }


    // ---------------------------------------------
    // INVENTORY CORRECTION
    // ---------------------------------------------

    if (
        type === "INVENTORY_CORRECTION"
    ) {

        window.location.href =
            "icr_approval.html";

        return;

    }

}

// ====================================================
// NOTIFICATION SOUND
// ====================================================

let notificationAudio = null;


function initializeNotificationAudio() {

    if (notificationAudio) {
        return;
    }

    notificationAudio =
        new Audio(
            "notification.mp3"
        );

    notificationAudio.preload =
        "auto";

    notificationAudio.volume =
        0.65;

}


function unlockNotificationAudio() {

    initializeNotificationAudio();

    if (!notificationAudio) {
        return;
    }

    notificationAudio.muted = true;

    const promise =
        notificationAudio.play();

    if (promise !== undefined) {

        promise
            .then(() => {

                notificationAudio.pause();

                notificationAudio.currentTime =
                    0;

                notificationAudio.muted =
                    false;

            })
            .catch(() => {

                notificationAudio.muted =
                    false;

            });

    }

}


function playNotificationSound() {

    initializeNotificationAudio();

    if (!notificationAudio) {
        return;
    }

    notificationAudio.currentTime =
        0;

    notificationAudio.muted =
        false;

    const promise =
        notificationAudio.play();

    if (promise !== undefined) {

        promise.catch(error => {

            console.warn(
                "Notification sound blocked:",
                error
            );

        });

    }

}

// ====================================================
// NOTIFICATION TOAST
// ====================================================

function showNotificationToast(
    notification
) {

    if (!notification) {
        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.style.position =
        "fixed";


    toast.style.top =
        "80px";


    toast.style.right =
        "20px";


    toast.style.width =
        "340px";


    toast.style.maxWidth =
        "calc(100vw - 40px)";


    toast.style.background =
        "#ffffff";


    toast.style.border =
        "1px solid #dee2e6";


    toast.style.borderRadius =
        "8px";


    toast.style.boxShadow =
        "0 5px 20px rgba(0,0,0,0.18)";


    toast.style.padding =
        "14px";


    toast.style.zIndex =
        "2147483647";


    toast.innerHTML = `

        <div
            style="
                font-weight:700;
                font-size:14px;
            "
        >
            <i
                class="fa-solid fa-bell me-2"
            ></i>

            ${escapeNotificationText(
                notification.title
            )}

        </div>


        <div
            style="
                font-size:12px;
                color:#555;
                margin-top:5px;
            "
        >
            ${escapeNotificationText(
                notification.message || ""
            )}
        </div>

    `;


    document.body.appendChild(
        toast
    );


    setTimeout(
        function() {

            toast.remove();

        },
        6000
    );

}


// ====================================================
// SAFE TEXT ESCAPE
// ====================================================

function escapeNotificationText(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


// ====================================================
// START NOTIFICATION SYSTEM
// ====================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeNotifications();

    }
);
