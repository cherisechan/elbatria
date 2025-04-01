interface CardProp {
    name: string,
}
export default function BaseCard({name}:CardProp) {
    return (
        <div className="border-solid w-10 h-10 text-black">
            {name}
        </div>
    )
}