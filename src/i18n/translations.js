export const LANGUAGE_KEY = 'cdl_language';

export const LANGUAGES = {
    system: {
        code: 'system',
        label: 'System default'
    },
    en: {
        code: 'en',
        label: 'English',
        locale: 'en-US'
    },
    ru: {
        code: 'ru',
        label: 'Русский',
        locale: 'ru-RU'
    }
};

export const translations = {
    en: {
        tabs: {
            wallet: 'Wallet',
            share: 'Share',
            archive: 'Archive',
            settings: 'Settings'
        },
        common: {
            appName: 'CDL Wallet',
            back: 'Back',
            cancel: 'Cancel',
            delete: 'Delete',
            error: 'Error',
            genericError: 'Something went wrong. Please try again.',
            ok: 'OK',
            read: 'Read ›',
            share: 'Share',
            expired: 'Expired',
            days: '{count} days',
            daysRemaining: '{count} days remaining'
        },
        docs: {
            cdl: 'CDL',
            med_card: 'Med Card',
            document: 'Document',
            oldDocument: 'Old {docLabel}',
            notUploaded: 'Not uploaded'
        },
        status: {
            valid: 'Valid',
            expiring: 'Expiring soon',
            critical: 'Almost expired',
            expired: 'Expired',
            archived: 'Archived'
        },
        header: {
            home: 'Stay road ready',
            share: 'Share documents',
            archive: 'Archive',
            settings: 'Settings'
        },
        home: {
            sectionLabel: 'Your documents',
            shareButton: 'Share your documents ›',
            tapToUpload: 'Tap to upload ›',
            expires: 'Expires'
        },
        upload: {
            title: 'Upload {docLabel}',
            archiveTitle: 'Upload old document',
            documentType: 'Document type',
            documentImage: 'Document image',
            noDocumentSelected: 'No document selected',
            camera: 'Camera',
            gallery: 'Gallery',
            pdfFile: 'PDF file',
            expiryDate: 'Expiry date',
            dateFormat: 'MM-DD-YYYY',
            dateExample: 'e.g. 04-25-2026',
            selectDate: 'Select date',
            done: 'Done',
            remindersPreview:
                'Reminders will be set 30 and 10 days before expiry.',
            saveDocument: 'Save document',
            cameraErrorTitle: 'Camera Error',
            cameraErrorMessage: 'Could not scan document.',
            expiryRequired: 'Please enter the expiry date.',
            invalidDate: 'Invalid date format. Use MM-DD-YYYY.',
            checkExpiryDate: 'Check expiry date',
            savedTitle: 'Saved',
            savedMessage: 'Your {docLabel} has been saved.',
            archiveSavedMessage: 'Old {docLabel} has been added to archive.',
            saveError: 'Could not save your {docLabel}. Please try again.'
        },
        shareScreen: {
            selectDocuments: 'Select documents',
            employerEmail: 'Employer email',
            expiresOn: 'Expires {date}',
            info: 'Images are converted to PDF before sending. Email is sent from your own email app.',
            preparing: 'Preparing...',
            emailDocuments: 'Email documents ›',
            shareDocuments: 'Share documents ›',
            enterEmail: 'Enter employer email',
            invalidEmailTitle: 'Invalid email',
            invalidEmailMessage: 'Please enter a valid email address.',
            selectOne: 'Select at least one document',
            emailSubject: 'CDL Wallet - Driver Documents',
            emailBody:
                'Hello,\n\nPlease find my documents attached.\n\n\nShared via CDL Wallet App',
            mailError: 'Could not open mail composer.',
            shareError: 'Could not open share menu.'
        },
        archive: {
            archivedDocuments: 'Archived documents',
            info: 'Employers sometimes ask for proof of a prior valid document. Keeping archived docs saves you a trip to the DMV.',
            empty: 'No archived documents',
            uploadOldDocument: 'Upload old document',
            expirationDate: 'Expiration date: {date}',
            addedToArchive: 'Added to archive: {date}',
            view: 'View',
            deleteTitle: 'Delete archived document',
            deleteMessage:
                'Permanently delete this expired {docLabel}? This cannot be undone.',
            loadError: 'Could not load archive: {message}',
            deleteError: 'Could not delete this document. Please try again.'
        },
        viewer: {
            notFoundTitle: 'Not found',
            notFoundMessage: 'Document not found.',
            loadError: 'Could not load document: {message}',
            deleteTitle: 'Delete document',
            deleteMessage:
                'Are you sure you want to delete your {docLabel}? This cannot be undone.',
            deleteError: 'Could not delete {docLabel}. Please try again.',
            couldNotLoadImage: 'Could not load image',
            fullScreenHint: 'Click for full screen',
            status: 'Status',
            expires: 'Expires',
            daysRemaining: 'Days remaining',
            validity: 'Validity',
            replace: 'Replace',
            delete: 'Delete',
            archiveInfo:
                'When replacing docs, they are automatically added to archive.',
            archivedDeleteMessage:
                'Are you sure you want to delete this archived document?',
            archivedShareError: 'Could not share document',
            expirationDate: 'Expiration date',
            addedToArchive: 'Added to archive'
        },
        settings: {
            backup: 'Back Up',
            language: 'Language',
            appLanguage: 'App language',
            appLanguageSub: 'Choose the language used in the app',
            systemDefault: 'System default',
            keepBackupOn: 'Keep your backup on',
            backupText:
                'Your documents are stored on this device only. Make sure iCloud backup is enabled so your data transfers to a new phone automatically.',
            about: 'About',
            version: 'Version',
            storage: 'Storage',
            onDeviceOnly: 'On-device only',
            security: 'Security',
            protectedByIphone: 'Protected by iPhone security',
            privacyPolicy: 'Privacy Policy',
            termsOfUse: 'Terms of Use',
            dangerZone: 'Danger zone',
            deleteAllData: 'Delete all data',
            deleteAllDataMessage:
                'This will permanently delete all your documents, archive, and settings. This cannot be undone.',
            deleteEverything: 'Delete everything',
            dataDeletedTitle: 'Data deleted',
            dataDeletedMessage:
                'All your data has been removed from this device.',
            deleteError: 'Could not delete data. Please try again.',
            savePreferenceError: 'Could not save preference.'
        },
        lock: {
            unlock: 'Unlock CDL Wallet',
            useFaceId: 'Use Face ID'
        },
        biometrics: {
            prompt: 'Unlock CDL Wallet',
            cancel: 'Cancel'
        },
        docErrors: {
            load: 'Could not load documents: {message}',
            save: 'Could not save document: {message}',
            delete: 'Could not delete document: {message}',
            deleteArchived: 'Could not delete archived document: {message}'
        },
        notifications: {
            expiresIn30: 'Your {docLabel} expires in 30 days. Time to renew.',
            expiresIn10:
                "Your {docLabel} expires in 10 days. Don't get pulled off the road.",
            expiresTomorrow:
                'Your {docLabel} expires tomorrow. Immediate action required.'
        }
    },
    ru: {
        tabs: {
            wallet: 'Wallet',
            share: 'Поделиться',
            archive: 'Архив',
            settings: 'Настройки'
        },
        common: {
            appName: 'CDL Wallet',
            back: 'Назад',
            cancel: 'Отмена',
            delete: 'Удалить',
            error: 'Ошибка',
            genericError: 'Что-то пошло не так. Попробуйте еще раз.',
            ok: 'ок',
            read: 'Открыть ›',
            share: 'Отправить',
            expired: 'Истек',
            days: '{count} дн.',
            daysRemaining: 'Осталось {count} дн.'
        },
        docs: {
            cdl: 'CDL',
            med_card: 'Мед Карта',
            document: 'Документ',
            oldDocument: 'Старый документ: {docLabel}',
            notUploaded: 'Не загружено'
        },
        status: {
            valid: 'Активен',
            expiring: 'Скоро истекает',
            critical: 'Почти истек',
            expired: 'Истек',
            archived: 'В архиве'
        },
        header: {
            home: 'Будь готов к дороге',
            share: 'Поделиться документами',
            archive: 'Архив',
            settings: 'Настройки'
        },
        home: {
            sectionLabel: 'Ваши документы',
            shareButton: 'Отправить документы ›',
            tapToUpload: 'Нажмите, чтобы загрузить ›',
            expires: 'Истекает'
        },
        upload: {
            title: 'Загрузить {docLabel}',
            archiveTitle: 'Загрузить старый документ',
            documentType: 'Тип документа',
            documentImage: 'Изображение документа',
            noDocumentSelected: 'Загрузить документ',
            camera: 'Камера',
            gallery: 'Галерея',
            pdfFile: 'PDF-файл',
            expiryDate: 'Дата истечения',
            dateFormat: 'ММ-ДД-ГГГГ',
            dateExample: 'напр. 04-25-2026',
            selectDate: 'Выберите дату',
            done: 'Готово',
            remindersPreview:
                'Напоминания будут установлены за 30 и 10 дней до истечения срока.',
            saveDocument: 'Сохранить документ',
            cameraErrorTitle: 'Ошибка камеры',
            cameraErrorMessage: 'Не удалось отсканировать документ.',
            expiryRequired: 'Введите дату истечения срока.',
            invalidDate: 'Неверный формат даты. Используйте ММ-ДД-ГГГГ.',
            checkExpiryDate: 'Проверьте дату истечения',
            savedTitle: 'Сохранено',
            savedMessage: 'Ваш  {docLabel} сохранен.',
            archiveSavedMessage:
                'Старый документ {docLabel} добавлен в архив.',
            saveError:
                'Не удалось сохранить документ {docLabel}. Попробуйте еще раз.'
        },
        shareScreen: {
            selectDocuments: 'Выберите документы',
            employerEmail: 'Email работодателя',
            expiresOn: 'Истекает {date}',
            info: 'Изображения перед отправкой преобразуются в PDF формат. Email отправляется через ваше почтовое приложение.',
            preparing: 'Подготовка...',
            emailDocuments: 'Отправить по email ›',
            shareDocuments: 'Поделиться документами ›',
            enterEmail: 'Введите email работодателя',
            invalidEmailTitle: 'Неверный email',
            invalidEmailMessage: 'Введите действительный email-адрес.',
            selectOne: 'Выберите хотя бы один документ',
            emailSubject: 'CDL Wallet - документы водителя',
            emailBody:
                'Здравствуйте,\n\nМои документы во вложении.\n\n\nОтправлено через приложение CDL Wallet',
            mailError: 'Не удалось открыть почтовое приложение.',
            shareError: 'Не удалось открыть меню отправки.'
        },
        archive: {
            archivedDocuments: 'Архивные документы',
            info: 'Работодатели иногда просят подтвердить ваш опыт работы. Архив поможет избежать лишней поездки в DMV.',
            empty: 'Архив пустой',
            uploadOldDocument: 'Загрузить старый документ',
            expirationDate: 'Дата истечения: {date}',
            addedToArchive: 'Добавлено в архив: {date}',
            view: 'Открыть',
            deleteTitle: 'Удалить архивный документ',
            deleteMessage:
                'Навсегда удалить этот архивный документ {docLabel}? Это действие нельзя отменить.',
            loadError: 'Не удалось загрузить архив: {message}',
            deleteError: 'Не удалось удалить документ. Попробуйте еще раз.'
        },
        viewer: {
            notFoundTitle: 'Не найдено',
            notFoundMessage: 'Документ не найден.',
            loadError: 'Не удалось загрузить документ: {message}',
            deleteTitle: 'Удалить документ',
            deleteMessage:
                'Вы уверены, что хотите удалить документ {docLabel}? Это действие нельзя отменить.',
            deleteError:
                'Не удалось удалить документ {docLabel}. Попробуйте еще раз.',
            couldNotLoadImage: 'Не удалось загрузить изображение',
            fullScreenHint: 'Нажмите для полноэкранного просмотра',
            status: 'Статус',
            expires: 'Истекает',
            daysRemaining: 'Осталось дней',
            validity: 'Срок действия',
            replace: 'Заменить',
            delete: 'Удалить',
            archiveInfo:
                'При замене, документы автоматически добавляются в архив.',
            archivedDeleteMessage:
                'Вы уверены, что хотите удалить этот архивный документ?',
            archivedShareError: 'Не удалось отправить документ',
            expirationDate: 'Дата истечения',
            addedToArchive: 'Добавлено в архив'
        },
        settings: {
            backup: 'Резервная копия',
            language: 'Язык',
            appLanguage: 'Язык приложения',
            appLanguageSub: 'Выберите язык интерфейса приложения',
            systemDefault: 'Как в системе',
            keepBackupOn: 'Включите резервное копирование',
            backupText:
                'Ваши документы хранятся только на этом устройстве. Включите резервное копирование iCloud, чтобы данные автоматически переносились на новое устройство.',
            about: 'О приложении',
            version: 'Версия',
            storage: 'Хранение файлов',
            onDeviceOnly: 'Только на этом устройстве',
            security: 'Безопасность',
            protectedByIphone: 'Защищено безопасностью iPhone',
            privacyPolicy: 'Политика конфиденциальности',
            termsOfUse: 'Условия использования',
            dangerZone: 'Опасная зона',
            deleteAllData: 'Удалить все данные',
            deleteAllDataMessage:
                'Это навсегда удалит все ваши документы, архив и настройки. Это действие нельзя отменить.',
            deleteEverything: 'Удалить все',
            dataDeletedTitle: 'Данные удалены',
            dataDeletedMessage: 'Все данные удалены с этого устройства.',
            deleteError: 'Не удалось удалить данные. Попробуйте еще раз.',
            savePreferenceError: 'Не удалось сохранить настройку.'
        },
        lock: {
            unlock: 'Разблокировать CDL Wallet',
            useFaceId: 'Использовать Face ID'
        },
        biometrics: {
            prompt: 'Разблокировать CDL Wallet',
            cancel: 'Отмена'
        },
        docErrors: {
            load: 'Не удалось загрузить документы: {message}',
            save: 'Не удалось сохранить документ: {message}',
            delete: 'Не удалось удалить документ: {message}',
            deleteArchived: 'Не удалось удалить архивный документ: {message}'
        },
        notifications: {
            expiresIn30:
                'Срок действия документа {docLabel} истекает через 30 дней. Пора обновить.',
            expiresIn10:
                'Срок действия документа {docLabel} истекает через 10 дней. Не откладывайте обновление.',
            expiresTomorrow:
                'Срок действия документа {docLabel} истекает завтра. Требуется срочное действие.'
        }
    }
};
