import { useEffect } from "react"
import { getProducts } from "../services/publicApi"

function Products() {
  useEffect(() => {
    getProducts()
      .then((response) => {
        console.log("body:", response.data)
      })
      .catch((err) => console.error("getProducts failed:", err))
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Products</h1>
    </div>
  )
}

export default Products