/**
 * Proje genelinde kullanılan Kullanıcı Rolleri
 * Bu dosya, rollerin tek bir yerden yönetilmesini sağlar ve
 * kod içinde "magic string" kullanımını engeller.
 */

export const ROLES = {
    // Tam yetkili yönetici
    ADMIN: 'admin',

    // İçerik düzenleyebilen editör
    EDITOR: 'editor',

    // İçerik oluşturabilen yazar
    AUTHOR: 'author',

    // Standart kayıtlı kullanıcı
    USER: 'user',

    // Ziyaretçi (Giriş yapmamış)
    GUEST: 'guest'
};

export const ROLE_LABELS = {
    [ROLES.ADMIN]: 'Yönetici',
    [ROLES.EDITOR]: 'Editör',
    [ROLES.AUTHOR]: 'Yazar',
    [ROLES.USER]: 'Kullanıcı',
    [ROLES.GUEST]: 'Ziyaretçi'
};

export default ROLES;
