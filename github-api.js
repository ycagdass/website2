class GitHubAPI {
    static get baseURL() {
        return 'https://api.github.com';
    }

    static get owner() {
        return 'ycagdass'; // GitHub kullanıcı adınız
    }

    static get repo() {
        return 'website2'; // Repository adınız
    }

    static get token() {
        return localStorage.getItem('githubToken');
    }

    static get headers() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    static async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/user`, {
                headers: this.headers
            });
            
            if (response.ok) {
                const user = await response.json();
                console.log('GitHub bağlantısı başarılı:', user.login);
                return true;
            } else {
                console.error('GitHub bağlantı hatası:', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error('GitHub API hatası:', error);
            throw new Error('GitHub API\'ye bağlanılamadı: ' + error.message);
        }
    }

    static async updateDataFile(data, commitMessage = 'Update data from admin panel') {
        try {
            const fileName = 'data.json';
            const content = JSON.stringify(data, null, 2);
            
            // Önce dosyanın mevcut durumunu al
            let sha = null;
            try {
                const fileResponse = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${fileName}`, {
                    headers: this.headers
                });
                
                if (fileResponse.ok) {
                    const fileData = await fileResponse.json();
                    sha = fileData.sha;
                }
            } catch (error) {
                console.log('Dosya bulunamadı, yeni dosya oluşturulacak');
            }

            // Dosyayı güncelle veya oluştur
            const updateData = {
                message: commitMessage,
                content: btoa(unescape(encodeURIComponent(content))), // Base64 encode
                branch: 'main'
            };

            if (sha) {
                updateData.sha = sha;
            }

            const response = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${fileName}`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Dosya başarıyla güncellendi:', result);
                return result;
            } else {
                const errorData = await response.json();
                throw new Error(`GitHub API hatası: ${response.status} - ${errorData.message}`);
            }
        } catch (error) {
            console.error('Dosya güncelleme hatası:', error);
            throw error;
        }
    }
}

// Global olarak erişilebilir yap
window.GitHubAPI = GitHubAPI;