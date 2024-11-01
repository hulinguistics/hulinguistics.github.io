// footer の copyright の年号を今年にするスクリプト
{
  // 今年の年号を取得
  const currentYear = new Date().getFullYear();
  // .this-year の要素をすべて取得
  const elements = document.querySelectorAll("span.this-year");

  for (const element of elements) {
    // 要素のテキストを今年の年号に書き換え
    element.textContent = currentYear;
  }
}
