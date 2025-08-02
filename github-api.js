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
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    // Rate limiting state - Enhanced for cPanel hosting
    static rateLimit = {
        remaining: 5000,
        reset: null,
        used: 0,
        isHostedOnCPanel: true // Flag for cPanel specific optimizations
    };

    // Check rate limit status - cPanel hosting aware
    static checkRateLimit() {
        const now = new Date();
        if (this.rateLimit.reset && now < new Date(this.rateLimit.reset)) {
            if (this.rateLimit.remaining <= 10) { // More conservative for cPanel
                const resetTime = new Date(this.rateLimit.reset);
                const waitTime = Math.ceil((resetTime - now) / 1000);
                throw new Error(`Rate limit approaching. Try again in ${waitTime} seconds.`);
            }
        }
    }

    // Update rate limit from response headers - cPanel optimized
    static updateRateLimit(response) {
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');
        const used = response.headers.get('x-ratelimit-used');

        if (remaining) this.rateLimit.remaining = parseInt(remaining);
        if (reset) this.rateLimit.reset = new Date(parseInt(reset) * 1000);
        if (used) this.rateLimit.used = parseInt(used);

        // Log with cPanel context
        console.log(`GitHub API Rate Limit (cPanel hosting) - Remaining: ${this.rateLimit.remaining}, Used: ${this.rateLimit.used}`);
        
        // Warn if rate limit is getting low for cPanel hosting
        if (this.rateLimit.remaining < 100) {
            console.warn('GitHub API rate limit is running low for cPanel hosting environment');
        }
    }

    // Retry logic with exponential backoff
    static async retryRequest(requestFn, maxRetries = 3, baseDelay = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await requestFn();
            } catch (error) {
                console.log(`Request attempt ${attempt} failed:`, error.message);
                
                if (attempt === maxRetries) {
                    throw error;
                }

                // Exponential backoff: 1s, 2s, 4s
                const delay = baseDelay * Math.pow(2, attempt - 1);
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    static async testConnection() {
        try {
            this.checkRateLimit();

            const response = await this.retryRequest(async () => {
                const res = await fetch(`${this.baseURL}/user`, {
                    headers: this.headers
                });

                this.updateRateLimit(res);

                if (!res.ok) {
                    if (res.status === 401) {
                        throw new Error('GitHub token geçersiz veya yetkisiz');
                    } else if (res.status === 403) {
                        throw new Error('GitHub API rate limit aşıldı');
                    } else {
                        throw new Error(`GitHub API hatası: ${res.status} ${res.statusText}`);
                    }
                }

                return res;
            });
            
            const user = await response.json();
            console.log('GitHub bağlantısı başarılı:', user.login);
            
            // Test repository access
            try {
                const repoResponse = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}`, {
                    headers: this.headers
                });

                if (!repoResponse.ok) {
                    throw new Error('Repository erişim hatası');
                }

                console.log('Repository erişimi doğrulandı');
            } catch (repoError) {
                console.warn('Repository erişimi kontrol edilemedi:', repoError);
                // Still return true for user auth, but warn about repo access
            }

            return true;
        } catch (error) {
            console.error('GitHub bağlantı testi hatası:', error);
            throw new Error('GitHub bağlantısı başarısız: ' + error.message);
        }
    }

    static async updateDataFile(data, commitMessage = 'Update data from admin panel') {
        try {
            this.checkRateLimit();

            if (!data || typeof data !== 'object') {
                throw new Error('Geçersiz veri formatı');
            }

            // Add metadata to data
            const enrichedData = {
                ...data,
                _metadata: {
                    lastUpdated: new Date().toISOString(),
                    version: "1.0.0",
                    source: "admin-panel",
                    userAgent: navigator.userAgent || "unknown"
                }
            };

            const fileName = 'data.json';
            const content = JSON.stringify(enrichedData, null, 2);
            
            // Validate JSON before sending
            try {
                JSON.parse(content);
            } catch (jsonError) {
                throw new Error('JSON formatı geçersiz: ' + jsonError.message);
            }

            const result = await this.retryRequest(async () => {
                // Önce dosyanın mevcut durumunu al
                let sha = null;
                try {
                    const fileResponse = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}/contents/${fileName}`, {
                        headers: this.headers
                    });
                    
                    this.updateRateLimit(fileResponse);

                    if (fileResponse.ok) {
                        const fileData = await fileResponse.json();
                        sha = fileData.sha;
                        
                        // Check if content is actually different
                        const currentContent = atob(fileData.content.replace(/\s/g, ''));
                        const newContent = btoa(unescape(encodeURIComponent(content)));
                        
                        if (currentContent === newContent) {
                            console.log('Content is identical, skipping update');
                            return { skipped: true, message: 'No changes detected' };
                        }
                    }
                } catch (error) {
                    console.log('Dosya bulunamadı veya erişim hatası, yeni dosya oluşturulacak');
                }

                // Dosyayı güncelle veya oluştur
                const updateData = {
                    message: commitMessage,
                    content: btoa(unescape(encodeURIComponent(content))), // Base64 encode with UTF-8 support
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

                this.updateRateLimit(response);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                    throw new Error(`GitHub API hatası: ${response.status} - ${errorData.message}`);
                }

                return await response.json();
            });

            if (result.skipped) {
                console.log('Update skipped:', result.message);
            } else {
                console.log('Dosya başarıyla güncellendi:', result);
                
                // Store sync timestamp
                localStorage.setItem('lastGitHubSync', new Date().toISOString());
            }

            return result;

        } catch (error) {
            console.error('Dosya güncelleme hatası:', error);
            throw error;
        }
    }

    // Get repository information
    static async getRepositoryInfo() {
        try {
            this.checkRateLimit();

            const response = await this.retryRequest(async () => {
                const res = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}`, {
                    headers: this.headers
                });

                this.updateRateLimit(res);

                if (!res.ok) {
                    throw new Error(`Repository info hatası: ${res.status} ${res.statusText}`);
                }

                return res;
            });

            return await response.json();
        } catch (error) {
            console.error('Repository info alınamadı:', error);
            throw error;
        }
    }

    // Get current data file content
    static async getCurrentData() {
        try {
            this.checkRateLimit();

            const response = await this.retryRequest(async () => {
                const res = await fetch(`${this.baseURL}/repos/${this.owner}/${this.repo}/contents/data.json`, {
                    headers: this.headers
                });

                this.updateRateLimit(res);

                if (!res.ok) {
                    if (res.status === 404) {
                        return null; // File doesn't exist
                    }
                    throw new Error(`Data file hatası: ${res.status} ${res.statusText}`);
                }

                return res;
            });

            if (!response) {
                return null;
            }

            const fileData = await response.json();
            const content = atob(fileData.content.replace(/\s/g, ''));
            
            try {
                return JSON.parse(content);
            } catch (parseError) {
                throw new Error('JSON parse hatası: ' + parseError.message);
            }

        } catch (error) {
            console.error('Current data alınamadı:', error);
            throw error;
        }
    }

    // Health check method
    static async healthCheck() {
        try {
            const isConnected = await this.testConnection();
            const repoInfo = await this.getRepositoryInfo();
            
            return {
                connected: isConnected,
                repository: repoInfo?.name || 'unknown',
                rateLimit: this.rateLimit,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message,
                rateLimit: this.rateLimit,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Global olarak erişilebilir yap
window.GitHubAPI = GitHubAPI;