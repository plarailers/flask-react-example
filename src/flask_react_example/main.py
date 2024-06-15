import time
from threading import Thread

from flask import Flask, jsonify

# サーバの設定です。
app = Flask(__name__, static_url_path="", static_folder="../../ui/dist")


# 路線の状態です。
state = {
    "trains": {
        "t0": {"mileage": 0.0},
        "t1": {"mileage": 50.0},
        "t2": {"mileage": 20.0},
    },
}


# 状態を取得する API です。
@app.route("/api/state")
def get_state():
    return jsonify(state)

# 状態を更新するループです。
def update_state_loop():
    paused_trains = set()
    pause_time = {}
    while True:
        for train_id, train in state["trains"].items():
            if train_id in paused_trains:
                if pause_time[train_id] > 0:
                    pause_time[train_id] -= 1
                else:
                    paused_trains.remove(train_id)
            else:
                train["mileage"] = (train["mileage"] + 0.5) % 100.0

                # 一定の条件で列車を一時停止させる例
                if train["mileage"] == 35 or train["mileage"] == 85:
                    paused_trains.add(train_id)
                    pause_time[train_id] = 10  # 一時停止時間（例: 10ステップ分）

        time.sleep(0.1)


def main():
    # 状態を更新するためのスレッドを立てます。
    update_state_thread = Thread(target=update_state_loop, daemon=True)
    update_state_thread.start()

    # サーバを起動します。
    app.run()


if __name__ == "__main__":
    main()
