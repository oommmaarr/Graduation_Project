import { useGSAP } from '@gsap/react'
import gsap from 'gsap';
import { cocktailLists, mockTailLists } from '../../../constants/index'

const Cocktails = () => {
	useGSAP(() => {
		const parallaxTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: '#cocktails',
				start: 'top 30%',
				end: 'bottom 80%',
				scrub: true,
			}
		})

		parallaxTimeline
			.from('#c-left-leaf', {
				x: -200, y: 100
			})
			.from('#c-right-leaf', {
				x: 100, y: 100
			})
	})

	return (
		<section id="cocktails" className="noisy">
			<div className="list">
				<div className="popular">
					<h2>Syntra AI Capabilities:</h2>

					<ul>
						{cocktailLists.map(({ name, subTitle, value }) => (
							<li key={name}>
								<div className="md:me-28">
									<h3 className='text-[#0094BD]'>{name}</h3>
									<p>{subTitle}</p>
								</div>
								<span>{value}</span>
							</li>
						))}
					</ul>
				</div>

				<div className="loved">
					<h2>Core Engine Capabilities:</h2>

					<ul>
						{mockTailLists.map(({ name, subTitle, value }) => (
							<li key={name}>
								<div className="md:me-28 ">
									<h3 className='text-[#7E1487]'>{name}</h3>
									<p>{subTitle}</p>
								</div>
								<span>{value}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	)
}

export default Cocktails