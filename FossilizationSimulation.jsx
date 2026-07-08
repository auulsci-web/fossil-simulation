import React, { useState, useMemo, useEffect } from "react";

// 과학적 보존 지수 매핑 상수
const SCORES = {
    burial: { fast: 40, slow: -50 },
    grain: { clay: 30, sand: 10, gravel: -30 },
    benthic: { absent: 20, present: -20 },
    depth: { deep: 10, shallow: -10 }
};

// 생물 정보 매핑 상수 (성공 기준 및 이미지 경로)
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

export default function FossilizationSimulation() {
    // 1. 상태(State) 정의
    const [organism, setOrganism] = useState("trilobite");
    const [burialRate, setBurialRate] = useState("fast");
    const [grainSize, setGrainSize] = useState("clay");
    const [benthic, setBenthic] = useState("absent");
    const [depth, setDepth] = useState("deep");
    
    // 실험 테스트 실행 여부 및 성공 여부 상태
    const [isTested, setIsTested] = useState(false);
    const [testResult, setTestResult] = useState(null); // 'success' 또는 'failure'

    // 2. 실시간 점수 계산 (useMemo 활용)
    const score = useMemo(() => {
        const burialVal = SCORES.burial[burialRate];
        const grainVal = SCORES.grain[grainSize];
        const benthicVal = SCORES.benthic[benthic];
        const depthVal = SCORES.depth[depth];
        return burialVal + grainVal + benthicVal + depthVal;
    }, [burialRate, grainSize, benthic, depth]);

    // 프로그레스 바 백분율 환산 (범위: -110 ~ +100, 폭: 210)
    const percentage = useMemo(() => {
        const val = ((score + 110) / 210) * 100;
        return Math.max(0, Math.min(100, val));
    }, [score]);

    const currentOrganism = useMemo(() => {
        return ORGANISMS[organism];
    }, [organism]);

    // 임계치 기준선 백분율 위치 환산
    const thresholdPercentage = useMemo(() => {
        const val = ((currentOrganism.threshold + 110) / 210) * 100;
        return Math.max(0, Math.min(100, val));
    }, [currentOrganism]);

    // 입력 변수들이 변경되면 기존 실험 결과 초기화 및 이미지 락 적용
    useEffect(() => {
        setIsTested(false);
        setTestResult(null);
    }, [organism, burialRate, grainSize, benthic, depth]);

    // 3. 실험 버튼 작동 함수
    const handleRunExperiment = () => {
        const success = score >= currentOrganism.threshold;
        setIsTested(true);
        setTestResult(success ? "success" : "failure");
    };

    // 4. 감점 원인 자동 진단 및 배열 리턴
    const deductions = useMemo(() => {
        const list = [];
        
        if (burialRate === "slow") {
            list.push("❌ 매몰 속도가 너무 느려 퇴적물에 덮이기 전에 박테리아에 의해 부패하거나 포식자에게 훼손되었습니다.");
        }
        if (grainSize === "gravel") {
            list.push("❌ 자갈은 입자가 너무 굵어 틈새로 물과 산소가 계속 스며들어 유기물의 분해를 촉진시켰습니다.");
        }
        if (benthic === "present") {
            list.push("❌ 바닥에 사는 게나 조개 등 저서생물들이 퇴적층을 파헤치는 생물교란 작용을 일으켜 유해가 훼손되었습니다.");
        }
        if (depth === "shallow") {
            list.push("❌ 얕은 바다는 산소가 매우 풍부하여 호기성 미생물의 분해 활동이 활발했습니다.");
        }

        // 음수 감점 요인이 없는데 임계치 부족으로 실패한 예외 상태 처리
        if (list.length === 0 && isTested && testResult === "failure") {
            if (organism === "jellyfish") {
                list.push("❌ 해파리는 단단한 뼈나 껍질이 없는 부드러운 몸체로 구성되어 있어 보존 지수가 만점(100점)이어야만 화석화가 성공합니다. 퇴적물 입자로 모래(+10) 대신 가장 입자가 고운 진흙(+30)을 선택해 보존율을 극대화해 보세요.");
            } else if (organism === "anomalocaris") {
                list.push("❌ 아노말로카리스는 질긴 껍질을 지녔으나 성공을 위해서는 보다 미세한 퇴적 조건이 뒷받침되어야 합니다. 모래(+10) 환경 대신 진흙(+30) 퇴적층을 선택해 보세요.");
            }
        }
        return list;
    }, [burialRate, grainSize, benthic, depth, organism, isTested, testResult]);

    // 5. 렌더링 영역
    return (
        <div className="app_container">
            {/* 헤더 섹션 */}
            <header className="app_header">
                <h1 className="app_title">화석화 성공 탐구 시뮬레이터</h1>
                <p className="app_subtitle">과거 지질 시대의 생물이 화석으로 남기 위한 지구과학적 조건을 탐구해 보세요.</p>
            </header>

            {/* 상단: 변수 조절 패널 */}
            <section className="control_panel">
                <div className="control_group">
                    <label className="control_label">탐구 생물 선택</label>
                    <div className="select_wrapper">
                        <select 
                            className="control_select" 
                            value={organism} 
                            onChange={(e) => setOrganism(e.target.value)}
                        >
                            <option value="trilobite">삼엽충 (단단한 껍질)</option>
                            <option value="anomalocaris">아노말로카리스 (질긴 껍질)</option>
                            <option value="jellyfish">해파리 (부드러운 연체부)</option>
                        </select>
                    </div>
                </div>

                <div className="control_group">
                    <label className="control_label">매몰 속도</label>
                    <div className="select_wrapper">
                        <select 
                            className="control_select" 
                            value={burialRate} 
                            onChange={(e) => setBurialRate(e.target.value)}
                        >
                            <option value="fast">빠름 (+40)</option>
                            <option value="slow">느림 (-50)</option>
                        </select>
                    </div>
                </div>

                <div className="control_group">
                    <label className="control_label">퇴적물 입자 크기</label>
                    <div className="select_wrapper">
                        <select 
                            className="control_select" 
                            value={grainSize} 
                            onChange={(e) => setGrainSize(e.target.value)}
                        >
                            <option value="clay">진흙 (+30)</option>
                            <option value="sand">모래 (+10)</option>
                            <option value="gravel">자갈 (-30)</option>
                        </select>
                    </div>
                </div>

                <div className="control_group">
                    <label className="control_label">저서생물 유무</label>
                    <div className="select_wrapper">
                        <select 
                            className="control_select" 
                            value={benthic} 
                            onChange={(e) => setBenthic(e.target.value)}
                        >
                            <option value="absent">없음 (+20)</option>
                            <option value="present">있음 (-20)</option>
                        </select>
                    </div>
                </div>

                <div className="control_group">
                    <label className="control_label">바다의 깊이</label>
                    <div className="select_wrapper">
                        <select 
                            className="control_select" 
                            value={depth} 
                            onChange={(e) => setDepth(e.target.value)}
                        >
                            <option value="deep">깊은 바다 (+10)</option>
                            <option value="shallow">얕은 바다 (-10)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* 중간: 이미지 비교 영역 */}
            <section className="display_panel">
                <div className="image_card" id="organism_card">
                    <h3 className="card_title">선택한 생물 (원래 모습)</h3>
                    <div className="image_frame">
                        <img src={currentOrganism.livingImg} alt={currentOrganism.name} />
                    </div>
                    <div className="card_info">
                        {currentOrganism.info}
                    </div>
                </div>

                <div className="image_card" id="fossil_card">
                    <h3 className="card_title">화석화 결과</h3>
                    <div className="image_frame">
                        {/* 실험에 성공하지 못한 경우 락 오버레이 노출 */}
                        {(!isTested || testResult !== "success") && (
                            <div className="hidden_overlay" id="fossil_overlay">
                                <div className="overlay_content">
                                    <span className="lock_icon">🔒</span>
                                    <p>실험을 성공시켜 화석을 발견해 보세요!</p>
                                </div>
                            </div>
                        )}
                        <img 
                            src={currentOrganism.fossilImg} 
                            alt={`${currentOrganism.name} 화석`}
                            className={isTested && testResult === "success" ? "clear_effect" : "blur_effect"}
                        />
                    </div>
                    <div className="card_info">
                        {isTested && testResult === "success" 
                            ? `온전하게 화석으로 보존된 ${currentOrganism.name} 화석의 모습입니다.`
                            : "화석이 정상적으로 생성되면 여기에 결과가 표시됩니다."}
                    </div>
                </div>
            </section>

            {/* 하단: 결과 보존 지수 및 피드백 섹션 */}
            <section className="result_panel">
                <div className="score_section">
                    <div className="score_header">
                        <span className="score_title">보존 지수 (Preservation Score)</span>
                        <span className="score_value">{score}점</span>
                    </div>
                    <div className="progress_container">
                        <div className="progress_track">
                            <div className="progress_bar" style={{ width: `${percentage}%` }}></div>
                            {/* 성공 목표 임계치 가이드선 */}
                            <div className="threshold_line" style={{ left: `${thresholdPercentage}%` }}>
                                <div className="threshold_label">목표: {currentOrganism.threshold}점</div>
                            </div>
                        </div>
                    </div>
                    <div className="score_info_text">
                        현재 생물이 화석이 되기 위한 성공 임계치: <strong>{currentOrganism.threshold}점</strong>
                    </div>
                </div>

                {/* 실험 실행 버튼 */}
                <div className="action_section">
                    <button 
                        type="button" 
                        className="run_btn" 
                        onClick={handleRunExperiment}
                    >
                        실험 실행 (Run Experiment)
                    </button>
                </div>

                {/* 결과 피드백 패널 */}
                <div className={`feedback_container ${
                    isTested 
                        ? testResult === "success" 
                            ? "success_state" 
                            : "failure_state" 
                        : ""
                }`}>
                    <div className="feedback_header">
                        <div className="status_badge">
                            {!isTested 
                                ? "결과 대기 중" 
                                : testResult === "success" 
                                    ? "화석화 성공 (SUCCESS)!" 
                                    : "화석화 실패 (FAILURE)!"}
                        </div>
                    </div>
                    <div className="feedback_content">
                        <p className="feedback_main_text">
                            {!isTested 
                                ? "상단의 환경 변수들을 조절하고 실험 실행 버튼을 클릭하세요." 
                                : testResult === "success"
                                    ? `🎉 축하합니다! ${currentOrganism.name}이(가) 화석으로 성공적으로 보존되었습니다!`
                                    : `❌ 보존 지수가 부족하여 ${currentOrganism.name}이(가) 화석으로 보존되지 못했습니다.`}
                        </p>
                        
                        {/* 실패 시의 감점 피드백 항목 리스트 */}
                        {isTested && testResult === "failure" && deductions.length > 0 && (
                            <div className="deduction_list">
                                {deductions.map((text, idx) => (
                                    <div key={idx} className="deduction_item">
                                        {text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
