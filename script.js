
document.addEventListener('DOMContentLoaded', function() {
    const drawButton = document.getElementById('drawButton');
    const resultContainer = document.getElementById('result');
    const numbersContainer = document.getElementById('numbers');
    const shareButton = document.getElementById('shareButton');
    const spinner = drawButton.querySelector('.spinner-border');
    const btnText = drawButton.querySelector('.btn-text');

    let selectedNumbers = [];
    let drawCount = 0;

    // Tailwind 설정
    tailwind.config = {
        theme: {
            extend: {
                animation: {
                    'bounce-in': 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    'slide-up': 'slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                }
            }
        }
    };

    drawButton.addEventListener('click', function() {
        startDrawProcess();
    });

    shareButton?.addEventListener('click', function() {
        shareResults();
    });

    async function startDrawProcess() {
        // 버튼 로딩 상태
        drawButton.classList.add('loading');
        btnText.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>뽑는 중...';
        drawButton.disabled = true;

        // SweetAlert2로 뽑기 시작 알림
        await Swal.fire({
            title: '🎲 당번을 뽑고 있습니다!',
            text: '잠시만 기다려주세요...',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            background: 'rgba(255, 255, 255, 0.95)',
            backdrop: 'rgba(0, 0, 0, 0.4)',
            customClass: {
                popup: 'rounded-4 shadow-lg'
            }
        });

        // 번호 뽑기 로직
        const allNumbers = Array.from({length: 24}, (_, i) => i + 1);
        selectedNumbers = [];
        const availableNumbers = [...allNumbers];
        
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * availableNumbers.length);
            selectedNumbers.push(availableNumbers[randomIndex]);
            availableNumbers.splice(randomIndex, 1);
        }
        
        selectedNumbers.sort((a, b) => a - b);
        
        // 결과 표시
        await displayResults(selectedNumbers);
        
        // 버튼 복원
        drawButton.classList.remove('loading');
        btnText.innerHTML = '<i class="fas fa-redo me-2"></i>다시 뽑기!';
        drawButton.disabled = false;
        
        drawCount++;
    }

    async function displayResults(numbers) {
        // 기존 결과 초기화
        numbersContainer.innerHTML = '';
        resultContainer.classList.remove('d-none');
        
        // 성공 사운드 효과 (가능한 경우)
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIhCQA=');
            audio.volume = 0.3;
            audio.play().catch(() => {}); // 오류 무시
        } catch (e) {}

        // 번호들을 순차적으로 표시
        for (let i = 0; i < numbers.length; i++) {
            await new Promise(resolve => {
                setTimeout(() => {
                    const col = document.createElement('div');
                    col.className = 'col';
                    
                    const numberCard = document.createElement('div');
                    numberCard.className = 'card number-card h-100 text-center border-0 shadow-lg';
                    numberCard.style.animationDelay = `${i * 0.1}s`;
                    
                    numberCard.innerHTML = `
                        <div class="card-body d-flex flex-column justify-content-center">
                            <div class="number-display">${numbers[i]}</div>
                            <div class="number-label">${i + 1}번째</div>
                        </div>
                    `;
                    
                    col.appendChild(numberCard);
                    numbersContainer.appendChild(col);
                    
                    // 카드 클릭 이벤트 (재미 요소)
                    numberCard.addEventListener('click', function() {
                        this.style.transform = 'translateY(-5px) scale(1.05) rotateY(360deg)';
                        setTimeout(() => {
                            this.style.transform = 'translateY(-5px) scale(1.05)';
                        }, 600);
                    });
                    
                    resolve();
                }, i * 200);
            });
        }

        // 모든 번호 표시 완료 후 SweetAlert2로 축하 메시지
        setTimeout(async () => {
            await Swal.fire({
                title: '🎉 당번 선정 완료!',
                html: `
                    <div class="text-center">
                        <p class="mb-3">축하합니다! 다음 번호들이 선정되었습니다:</p>
                        <div class="d-flex justify-content-center gap-2 flex-wrap">
                            ${numbers.map(num => `<span class="badge bg-primary rounded-pill px-3 py-2 fs-6">${num}번</span>`).join('')}
                        </div>
                        <p class="mt-3 text-muted small">총 ${drawCount + 1}번째 추첨</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: '확인',
                confirmButtonColor: '#667eea',
                background: 'rgba(255, 255, 255, 0.95)',
                backdrop: 'rgba(0, 0, 0, 0.4)',
                customClass: {
                    popup: 'rounded-4 shadow-lg'
                }
            });
        }, numbers.length * 200 + 500);
    }

    function shareResults() {
        const numbersText = selectedNumbers.join(', ');
        const shareText = `🧹 청소 당번 뽑기 결과\n선정된 번호: ${numbersText}번\n총 ${drawCount}번째 추첨`;

        if (navigator.share) {
            navigator.share({
                title: '청소 당번 뽑기 결과',
                text: shareText,
                url: window.location.href
            }).catch(console.error);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                Swal.fire({
                    title: '복사 완료!',
                    text: '결과가 클립보드에 복사되었습니다.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    background: 'rgba(255, 255, 255, 0.95)',
                    customClass: {
                        popup: 'rounded-4 shadow-lg'
                    }
                });
            }).catch(() => {
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
    }

    function fallbackShare(text) {
        Swal.fire({
            title: '결과 공유',
            html: `<textarea class="form-control" rows="4" readonly>${text}</textarea>`,
            confirmButtonText: '닫기',
            confirmButtonColor: '#667eea',
            background: 'rgba(255, 255, 255, 0.95)',
            customClass: {
                popup: 'rounded-4 shadow-lg'
            }
        });
    }

    // 페이지 로드 완료 시 환영 메시지
    setTimeout(() => {
        Swal.fire({
            title: '환영합니다! 👋',
            text: '공정한 랜덤 추첨으로 청소 당번을 선정해보세요!',
            icon: 'info',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            background: 'rgba(255, 255, 255, 0.95)',
            customClass: {
                popup: 'rounded-4 shadow-lg'
            }
        });
    }, 1000);

    // 키보드 단축키 (스페이스바로 뽑기)
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && !drawButton.disabled) {
            e.preventDefault();
            drawButton.click();
        }
    });
});
