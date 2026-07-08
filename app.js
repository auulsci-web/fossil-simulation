/**
 * 화석화 성공 탐구 시뮬레이터 동작 스크립트
 */

// 과학적 보존 지수 매핑 데이터
const SCORES = {
    burial: { fast: 40, slow: -50 },
    grain: { clay: 30, sand: 10, gravel: -30 },
    benthic: { absent: 20, present: -20 },
    depth: { deep: 10, shallow: -10 }
};

// 생물 정보 매핑 데이터 (성공 기준 및 이미지)
const ORGANISMS = {
    trilobite: {
        name: "삼엽충",
        threshold: 60,
        info: "탄산칼슘의 단단한 등껍질을 가진 삼엽충입니다. 비교적 화석화 성공 확률이 높습니다.",
        livingImg: "picture/삼엽충.jpg",
        fossilImg: "picture/삼엽충화석.jpg"
    },
    anomalocaris: {
        name: "아노말로카리스",
        threshold: 80,
        info: "질긴 유기물질 껍질과 날카로운 집게발을 지닌 캄브리아기 최상위 포식자 아노말로카리스입니다. 보존을 위해 우수한 퇴적 환경이 필요합니다.",
        livingImg: "picture/아노말로카리스.jpg",
        fossilImg: "picture/아노말로카리스화석.jpg"
    },
    jellyfish: {
        name: "해파리",
        threshold: 100,
        info: "단단한 뼈나 껍질이 없고 온몸이 부드러운 물로 채워진 연체 생물입니다. 극한의 보존 환경에서만 흔적이 남을 수 있습니다.",
        livingImg: "picture/해파리.jpg",
        fossilImg: "picture/해파리화석.jpg"
    }
};

// DOM 요소 획득
const organism_select = document.getElementById("organism_select");
const burial_select = document.getElementById("burial_rate_select");
const grain_select = document.getElementById("grain_size_select");
const benthic_select = document.getElementById("benthic_select");
const depth_select = document.getElementById("depth_select");

const organism_img = document.getElementById("organism_img");
const organism_info = document.getElementById("organism_info");
const fossil_img = document.getElementById("fossil_img");
const fossil_info = document.getElementById("fossil_info");
const fossil_overlay = document.getElementById("fossil_overlay");

const current_score_display = document.getElementById("current_score_display");
const score_progress_bar = document.getElementById("score_progress_bar");
const target_threshold_line = document.getElementById("target_threshold_line");
const threshold_label_text = document.getElementById("threshold_label_text");
const required_score_text = document.getElementById("required_score_text");

const run_btn = document.getElementById("run_experiment_btn");
const feedback_panel = document.getElementById("feedback_panel");
const result_badge = document.getElementById("result_badge");
const feedback_main_message = document.getElementById("feedback_main_message");
const deduction_details = document.getElementById("deduction_details");

// 실시간 보존 지수 계산 및 UI 반영 함수
function update_real_time_status() {
    const selected_organism = ORGANISMS[organism_select.value];
    
    // 1. 이미지 및 설명 업데이트
    organism_img.src = selected_organism.livingImg;
    organism_info.textContent = selected_organism.info;
    fossil_img.src = selected_organism.fossilImg;
    
    // 변수 변경 시 화석화 이미지 락 및 결과 패널 초기화
    lock_fossil_result();
    
    // 2. 보존 지수 계산
    const burial_val = SCORES.burial[burial_select.value];
    const grain_val = SCORES.grain[grain_select.value];
    const benthic_val = SCORES.benthic[benthic_select.value];
    const depth_val = SCORES.depth[depth_select.value];
    
    const total_score = burial_val + grain_val + benthic_val + depth_val;
    current_score_display.textContent = `${total_score}점`;
    
    // 3. 프로그레스 바 갱신 (범위: -110점에서 +100점, 총 210점 폭)
    const percentage = ((total_score + 110) / 210) * 100;
    score_progress_bar.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    
    // 4. 임계치 위치 갱신
    const threshold_percentage = ((selected_organism.threshold + 110) / 210) * 100;
    target_threshold_line.style.left = `${threshold_percentage}%`;
    threshold_label_text.textContent = `목표: ${selected_organism.threshold}점`;
    required_score_text.textContent = `${selected_organism.threshold}점`;
}

// 화석 결과 락 설정 함수
function lock_fossil_result() {
    fossil_overlay.style.opacity = "1";
    fossil_overlay.style.pointerEvents = "all";
    fossil_img.classList.remove("clear_effect");
    fossil_img.classList.add("blur_effect");
    fossil_info.textContent = "화석이 정상적으로 생성되면 여기에 결과가 표시됩니다.";
    
    feedback_panel.className = "feedback_container";
    result_badge.textContent = "결과 대기 중";
    feedback_main_message.textContent = "상단의 환경 변수들을 조절하고 실험 실행 버튼을 클릭하세요.";
    deduction_details.innerHTML = "";
}

// 실험 실행 평가 함수
function run_experiment() {
    const selected_key = organism_select.value;
    const selected_organism = ORGANISMS[selected_key];
    
    const burial_val = SCORES.burial[burial_select.value];
    const grain_val = SCORES.grain[grain_select.value];
    const benthic_val = SCORES.benthic[benthic_select.value];
    const depth_val = SCORES.depth[depth_select.value];
    
    const total_score = burial_val + grain_val + benthic_val + depth_val;
    const is_success = total_score >= selected_organism.threshold;
    
    if (is_success) {
        // 성공 연출
        feedback_panel.className = "feedback_container success_state";
        result_badge.textContent = "화석화 성공 (SUCCESS)!";
        feedback_main_message.textContent = `🎉 축하합니다! ${selected_organism.name}이(가) 화석으로 성공적으로 보존되었습니다!`;
        
        fossil_overlay.style.opacity = "0";
        fossil_overlay.style.pointerEvents = "none";
        fossil_img.classList.remove("blur_effect");
        fossil_img.classList.add("clear_effect");
        fossil_info.textContent = `온전하게 화석으로 보존된 ${selected_organism.name} 화석의 모습입니다.`;
        deduction_details.innerHTML = "";
    } else {
        // 실패 연출
        feedback_panel.className = "feedback_container failure_state";
        result_badge.textContent = "화석화 실패 (FAILURE)!";
        feedback_main_message.textContent = `❌ 보존 지수가 부족하여 ${selected_organism.name}이(가) 화석으로 보존되지 못했습니다.`;
        
        fossil_overlay.style.opacity = "1";
        fossil_overlay.style.pointerEvents = "all";
        fossil_img.classList.remove("clear_effect");
        fossil_img.classList.add("blur_effect");
        fossil_info.textContent = "유해가 보존되지 못하고 소멸하였습니다.";
        
        // 감점 원인 분석
        display_deductions();
    }
}

// 감점 이유 출력 함수
function display_deductions() {
    deduction_details.innerHTML = "";
    let has_negative = false;
    
    // 1. 매몰 속도 느림
    if (burial_select.value === "slow") {
        add_deduction_item("❌ 매몰 속도가 너무 느려 퇴적물에 덮이기 전에 박테리아에 의해 부패하거나 포식자에게 훼손되었습니다.");
        has_negative = true;
    }
    
    // 2. 퇴적물 자갈
    if (grain_select.value === "gravel") {
        add_deduction_item("❌ 자갈은 입자가 너무 굵어 틈새로 물과 산소가 계속 스며들어 유기물의 분해를 촉진시켰습니다.");
        has_negative = true;
    }
    
    // 3. 저서생물 있음
    if (benthic_select.value === "present") {
        add_deduction_item("❌ 바닥에 사는 게나 조개 등 저서생물들이 퇴적층을 파헤치는 생물교란 작용을 일으켜 유해가 훼손되었습니다.");
        has_negative = true;
    }
    
    // 4. 얕은 바다
    if (depth_select.value === "shallow") {
        add_deduction_item("❌ 얕은 바다는 산소가 매우 풍부하여 호기성 미생물의 분해 활동이 활발했습니다.");
        has_negative = true;
    }
    
    // 5. 음수 요인이 없는데 실패한 특수 상황 (예: 해파리에서 퇴적물이 모래(+10)인 경우 등)
    if (!has_negative) {
        const selected_key = organism_select.value;
        if (selected_key === "jellyfish") {
            add_deduction_item("❌ 해파리는 단단한 뼈나 껍질이 없는 부드러운 몸체로 구성되어 있어 보존 지수가 만점(100점)이어야만 화석화가 성공합니다. 퇴적물 입자로 모래(+10) 대신 가장 입자가 고운 진흙(+30)을 선택해 보존율을 극대화해 보세요.");
        } else if (selected_key === "anomalocaris") {
            add_deduction_item("❌ 아노말로카리스는 질긴 껍질을 지녔으나 성공을 위해서는 보다 미세한 퇴적 조건이 뒷받침되어야 합니다. 모래(+10) 환경 대신 진흙(+30) 퇴적층을 선택해 보세요.");
        }
    }
}

// 감점 항목 요소 추가 헬퍼 함수
function add_deduction_item(text) {
    const item = document.createElement("div");
    item.className = "deduction_item";
    item.textContent = text;
    deduction_details.appendChild(item);
}

// 이벤트 리스너 등록
organism_select.addEventListener("change", update_real_time_status);
burial_select.addEventListener("change", update_real_time_status);
grain_select.addEventListener("change", update_real_time_status);
benthic_select.addEventListener("change", update_real_time_status);
depth_select.addEventListener("change", update_real_time_status);

run_btn.addEventListener("click", run_experiment);

// 초기 실행
update_real_time_status();
