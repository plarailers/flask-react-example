import time
from threading import Thread

from flask import Flask, jsonify

# サーバの設定です。
app = Flask(__name__, static_url_path="", static_folder="../../ui/dist")


# 路線の状態です。
state = {
    "trains": {
        "t0": {"mileage": 0.0},
    },
}


# 状態を取得する API です。
@app.route("/api/state")
def get_state():
    return jsonify(state)


# 状態を更新するループです。
def update_state_loop():
    while True:
        state["trains"]["t0"]["mileage"] = (
            state["trains"]["t0"]["mileage"] + 0.5
        ) % 100.0
        time.sleep(0.1)


def main():
    # 状態を更新するためのスレッドを立てます。
    update_state_thread = Thread(target=update_state_loop, daemon=True)
    update_state_thread.start()

    # サーバを起動します。
    app.run(debug=True)


if __name__ == "__main__":
    main()
