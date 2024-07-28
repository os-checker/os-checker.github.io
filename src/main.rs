fn main() {
    let output = std::process::Command::new("echo")
        .args(["hello", " world"])
        .output()
        .unwrap();
    println!(
        "success={} stdout={:?} stderr={:?}",
        output.status.success(),
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr),
    );
}
