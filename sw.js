self.addEventListener(
    "notificationclick",
    function(event) {

        event.notification.close();

        event.waitUntil(
            clients.matchAll({
                type: "window",
                includeUncontrolled: true
            }).then(
                function(clientList) {

                    for (
                        const client of clientList
                    ) {

                        if (
                            "focus" in client
                        ) {

                            client.focus();

                            return client;

                        }

                    }

                    if (
                        clients.openWindow
                    ) {

                        return clients.openWindow(
                            "/"
                        );

                    }

                }
            )
        );

    }
);
